import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from database import get_db
from models.schemas import WorkflowCreate, WorkflowUpdate, WorkflowResponse

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.post("", response_model=WorkflowResponse, status_code=201)
def create_workflow(payload: WorkflowCreate):
    db = get_db()
    workflow_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db.execute(
        "INSERT INTO workflows (id, name, description, workflow_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (workflow_id, payload.name, payload.description, json.dumps(payload.workflow_json), now, now),
    )
    db.commit()

    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()
    return _row_to_response(row)


@router.get("", response_model=list[WorkflowResponse])
def list_workflows():
    db = get_db()
    rows = db.execute("SELECT * FROM workflows ORDER BY updated_at DESC").fetchall()
    db.close()
    return [_row_to_response(r) for r in rows]


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return _row_to_response(row)


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(workflow_id: str, payload: WorkflowUpdate):
    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Workflow not found")

    now = datetime.now(timezone.utc).isoformat()
    name = payload.name if payload.name is not None else row["name"]
    description = payload.description if payload.description is not None else row["description"]
    workflow_json = json.dumps(payload.workflow_json) if payload.workflow_json is not None else row["workflow_json"]

    db.execute(
        "UPDATE workflows SET name = ?, description = ?, workflow_json = ?, updated_at = ? WHERE id = ?",
        (name, description, workflow_json, now, workflow_id),
    )
    db.commit()

    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()
    return _row_to_response(row)


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(workflow_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Workflow not found")

    db.execute("DELETE FROM workflows WHERE id = ?", (workflow_id,))
    db.commit()
    db.close()


def _row_to_response(row) -> WorkflowResponse:
    return WorkflowResponse(
        id=row["id"],
        name=row["name"],
        description=row["description"],
        workflow_json=json.loads(row["workflow_json"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
