import json
import uuid
import asyncio
import threading
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from database import get_db
from services.workflow_engine import execute_workflow

router = APIRouter(tags=["triggers"])

_schedules: dict[str, dict] = {}
_timers: dict[str, threading.Timer] = {}


class WebhookResponse(BaseModel):
    execution_id: str
    status: str
    final_output: Optional[str] = None


class ScheduleCreate(BaseModel):
    workflow_id: str
    cron_expression: str
    enabled: bool = True
    input_data: Optional[str] = None


def _init_schedules_table():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            cron_expression TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            input_data TEXT,
            last_run_at TEXT,
            next_run_at TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id)
        )
    """)
    db.commit()
    db.close()


_init_schedules_table()


def _parse_cron_to_seconds(expr: str) -> int:
    parts = expr.strip().split()
    if len(parts) == 1:
        val = parts[0].lower()
        if val.endswith("m"):
            return int(val[:-1]) * 60
        if val.endswith("h"):
            return int(val[:-1]) * 3600
        if val.endswith("s"):
            return int(val[:-1])
        return int(val) * 60
    if len(parts) == 5:
        minute = parts[0]
        if minute.startswith("*/"):
            return int(minute[2:]) * 60
        hour = parts[1]
        if hour.startswith("*/"):
            return int(hour[2:]) * 3600
    return 3600


def _run_scheduled(schedule_id: str):
    schedule = _schedules.get(schedule_id)
    if not schedule or not schedule["enabled"]:
        return

    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (schedule["workflow_id"],)).fetchone()
    db.close()

    if not row:
        return

    workflow_json = json.loads(row["workflow_json"])

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(execute_workflow(
            schedule["workflow_id"],
            workflow_json,
            schedule.get("input_data"),
        ))
    finally:
        loop.close()

    db = get_db()
    db.execute("UPDATE schedules SET last_run_at = ? WHERE id = ?",
               (datetime.now(timezone.utc).isoformat(), schedule_id))
    db.commit()
    db.close()

    interval = _parse_cron_to_seconds(schedule["cron_expression"])
    timer = threading.Timer(interval, _run_scheduled, args=[schedule_id])
    timer.daemon = True
    timer.start()
    _timers[schedule_id] = timer


def _start_schedule(schedule_id: str, schedule: dict):
    _schedules[schedule_id] = schedule
    interval = _parse_cron_to_seconds(schedule["cron_expression"])
    timer = threading.Timer(interval, _run_scheduled, args=[schedule_id])
    timer.daemon = True
    timer.start()
    _timers[schedule_id] = timer


def _stop_schedule(schedule_id: str):
    if schedule_id in _timers:
        _timers[schedule_id].cancel()
        del _timers[schedule_id]
    _schedules.pop(schedule_id, None)


# --- Webhook endpoint ---

@router.post("/api/webhooks/{workflow_id}", response_model=WebhookResponse)
async def webhook_trigger(workflow_id: str, request: Request):
    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_json = json.loads(row["workflow_json"])

    body = None
    try:
        body = await request.json()
        input_data = body.get("input", body)
    except Exception:
        raw = await request.body()
        input_data = raw.decode("utf-8") if raw else None

    result = await execute_workflow(workflow_id, workflow_json, input_data)

    output = result.final_output
    if isinstance(output, (dict, list)):
        output = json.dumps(output)
    elif output is not None:
        output = str(output)

    return WebhookResponse(
        execution_id=result.execution_id,
        status=result.status,
        final_output=output,
    )


# --- Schedule CRUD ---

@router.post("/api/schedules")
def create_schedule(payload: ScheduleCreate):
    db = get_db()
    row = db.execute("SELECT id FROM workflows WHERE id = ?", (payload.workflow_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Workflow not found")

    schedule_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db.execute(
        "INSERT INTO schedules (id, workflow_id, cron_expression, enabled, input_data, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (schedule_id, payload.workflow_id, payload.cron_expression, int(payload.enabled), payload.input_data, now),
    )
    db.commit()
    db.close()

    schedule = {
        "workflow_id": payload.workflow_id,
        "cron_expression": payload.cron_expression,
        "enabled": payload.enabled,
        "input_data": payload.input_data,
    }

    if payload.enabled:
        _start_schedule(schedule_id, schedule)

    return {"id": schedule_id, "status": "created", "interval_seconds": _parse_cron_to_seconds(payload.cron_expression)}


@router.get("/api/schedules")
def list_schedules():
    db = get_db()
    rows = db.execute("""
        SELECT s.*, w.name as workflow_name
        FROM schedules s
        LEFT JOIN workflows w ON s.workflow_id = w.id
        ORDER BY s.created_at DESC
    """).fetchall()
    db.close()

    return [
        {
            "id": r["id"],
            "workflow_id": r["workflow_id"],
            "workflow_name": r["workflow_name"],
            "cron_expression": r["cron_expression"],
            "enabled": bool(r["enabled"]),
            "input_data": r["input_data"],
            "last_run_at": r["last_run_at"],
            "created_at": r["created_at"],
            "is_active": r["id"] in _timers,
        }
        for r in rows
    ]


@router.delete("/api/schedules/{schedule_id}")
def delete_schedule(schedule_id: str):
    _stop_schedule(schedule_id)

    db = get_db()
    db.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
    db.commit()
    db.close()

    return {"status": "deleted"}


@router.post("/api/schedules/{schedule_id}/toggle")
def toggle_schedule(schedule_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM schedules WHERE id = ?", (schedule_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Schedule not found")

    new_enabled = not bool(row["enabled"])
    db.execute("UPDATE schedules SET enabled = ? WHERE id = ?", (int(new_enabled), schedule_id))
    db.commit()
    db.close()

    if new_enabled:
        _start_schedule(schedule_id, {
            "workflow_id": row["workflow_id"],
            "cron_expression": row["cron_expression"],
            "enabled": True,
            "input_data": row["input_data"],
        })
    else:
        _stop_schedule(schedule_id)

    return {"id": schedule_id, "enabled": new_enabled}
