import json
from fastapi import APIRouter, HTTPException, BackgroundTasks

from database import get_db
from models.schemas import ExecuteRequest, ExecutionResult, NodeExecutionLog
from services.workflow_engine import execute_workflow, cancel_execution

router = APIRouter(tags=["executions"])


@router.post("/api/workflows/{workflow_id}/execute", response_model=ExecutionResult)
async def start_execution(workflow_id: str, payload: ExecuteRequest = None):
    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_json = json.loads(row["workflow_json"])
    initial_input = payload.input if payload else None

    result = await execute_workflow(workflow_id, workflow_json, initial_input)
    return result


@router.get("/api/executions/{execution_id}", response_model=ExecutionResult)
def get_execution(execution_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM executions WHERE id = ?", (execution_id,)).fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Execution not found")

    return _row_to_result(row)


@router.post("/api/executions/{execution_id}/cancel")
def cancel(execution_id: str):
    db = get_db()
    row = db.execute("SELECT id, status FROM executions WHERE id = ?", (execution_id,)).fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=404, detail="Execution not found")

    if row["status"] not in ("running",):
        raise HTTPException(status_code=400, detail=f"Cannot cancel execution with status: {row['status']}")

    cancel_execution(execution_id)
    return {"message": "Cancellation requested", "execution_id": execution_id}


@router.get("/api/workflows/{workflow_id}/executions", response_model=list[ExecutionResult])
def list_executions(workflow_id: str):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM executions WHERE workflow_id = ? ORDER BY started_at DESC",
        (workflow_id,),
    ).fetchall()
    db.close()

    return [_row_to_result(r) for r in rows]


def _row_to_result(row) -> ExecutionResult:
    node_logs = []
    if row["node_logs"]:
        for log_data in json.loads(row["node_logs"]):
            node_logs.append(NodeExecutionLog(**log_data))

    final_output = None
    if row["final_output"]:
        try:
            final_output = json.loads(row["final_output"])
        except (json.JSONDecodeError, TypeError):
            final_output = row["final_output"]

    return ExecutionResult(
        execution_id=row["id"],
        workflow_id=row["workflow_id"],
        status=row["status"],
        started_at=row["started_at"],
        completed_at=row["completed_at"],
        total_duration_ms=row["total_duration_ms"],
        node_logs=node_logs,
        final_output=final_output,
        total_tokens_used=row["total_tokens"] or 0,
        total_api_calls=0,
        error_summary=row["error_summary"],
    )
