import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter

from database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
def get_analytics():
    db = get_db()

    total_workflows = db.execute("SELECT COUNT(*) as c FROM workflows").fetchone()["c"]
    total_executions = db.execute("SELECT COUNT(*) as c FROM executions").fetchone()["c"]

    status_counts = {}
    for row in db.execute("SELECT status, COUNT(*) as c FROM executions GROUP BY status").fetchall():
        status_counts[row["status"]] = row["c"]

    total_tokens = db.execute("SELECT COALESCE(SUM(total_tokens), 0) as t FROM executions").fetchone()["t"]
    avg_duration = db.execute("SELECT COALESCE(AVG(total_duration_ms), 0) as d FROM executions WHERE total_duration_ms IS NOT NULL").fetchone()["d"]

    recent = db.execute("""
        SELECT e.id, e.workflow_id, e.status, e.started_at, e.total_duration_ms, e.total_tokens,
               w.name as workflow_name
        FROM executions e
        LEFT JOIN workflows w ON e.workflow_id = w.id
        ORDER BY e.started_at DESC LIMIT 20
    """).fetchall()

    recent_list = [
        {
            "id": r["id"],
            "workflow_id": r["workflow_id"],
            "workflow_name": r["workflow_name"],
            "status": r["status"],
            "started_at": r["started_at"],
            "duration_ms": r["total_duration_ms"],
            "tokens": r["total_tokens"],
        }
        for r in recent
    ]

    daily_stats = defaultdict(lambda: {"executions": 0, "tokens": 0, "successes": 0, "failures": 0})
    rows = db.execute("""
        SELECT started_at, status, total_tokens
        FROM executions
        WHERE started_at IS NOT NULL
        ORDER BY started_at DESC LIMIT 500
    """).fetchall()

    for row in rows:
        try:
            day = row["started_at"][:10]
        except (TypeError, IndexError):
            continue
        daily_stats[day]["executions"] += 1
        daily_stats[day]["tokens"] += row["total_tokens"] or 0
        if row["status"] == "completed":
            daily_stats[day]["successes"] += 1
        elif row["status"] in ("failed", "error"):
            daily_stats[day]["failures"] += 1

    daily_list = [
        {"date": date, **stats}
        for date, stats in sorted(daily_stats.items(), reverse=True)[:30]
    ]

    top_workflows = db.execute("""
        SELECT w.id, w.name, COUNT(e.id) as run_count,
               COALESCE(SUM(e.total_tokens), 0) as total_tokens,
               COALESCE(AVG(e.total_duration_ms), 0) as avg_duration_ms
        FROM workflows w
        LEFT JOIN executions e ON w.id = e.workflow_id
        GROUP BY w.id
        ORDER BY run_count DESC
        LIMIT 10
    """).fetchall()

    top_list = [
        {
            "id": r["id"],
            "name": r["name"],
            "run_count": r["run_count"],
            "total_tokens": r["total_tokens"],
            "avg_duration_ms": round(r["avg_duration_ms"]),
            "estimated_cost": round(r["total_tokens"] * 0.000003, 4),
        }
        for r in top_workflows
    ]

    db.close()

    success_rate = 0
    if total_executions > 0:
        success_rate = round((status_counts.get("completed", 0) / total_executions) * 100, 1)

    estimated_total_cost = round(total_tokens * 0.000003, 4)

    return {
        "summary": {
            "total_workflows": total_workflows,
            "total_executions": total_executions,
            "success_rate": success_rate,
            "total_tokens": total_tokens,
            "estimated_cost": estimated_total_cost,
            "avg_duration_ms": round(avg_duration),
        },
        "status_breakdown": status_counts,
        "daily_stats": daily_list,
        "top_workflows": top_list,
        "recent_executions": recent_list,
    }
