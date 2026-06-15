import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from database import get_db
from services.workflow_engine import execute_workflow

router = APIRouter()


class ExecutionBroadcaster:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, execution_id: str, ws: WebSocket):
        await ws.accept()
        if execution_id not in self._connections:
            self._connections[execution_id] = []
        self._connections[execution_id].append(ws)

    def disconnect(self, execution_id: str, ws: WebSocket):
        if execution_id in self._connections:
            self._connections[execution_id] = [
                c for c in self._connections[execution_id] if c is not ws
            ]
            if not self._connections[execution_id]:
                del self._connections[execution_id]

    async def broadcast(self, execution_id: str, data: dict):
        connections = self._connections.get(execution_id, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(execution_id, ws)


broadcaster = ExecutionBroadcaster()


@router.websocket("/ws/executions/{execution_id}")
async def execution_ws(ws: WebSocket, execution_id: str):
    await broadcaster.connect(execution_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(execution_id, ws)


@router.websocket("/ws/execute/{workflow_id}")
async def execute_and_stream(ws: WebSocket, workflow_id: str):
    await ws.accept()

    db = get_db()
    row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    db.close()

    if not row:
        await ws.send_json({"type": "error", "message": "Workflow not found"})
        await ws.close()
        return

    workflow_json = json.loads(row["workflow_json"])

    try:
        input_msg = await asyncio.wait_for(ws.receive_text(), timeout=2.0)
        input_data = json.loads(input_msg).get("input")
    except (asyncio.TimeoutError, Exception):
        input_data = None

    await ws.send_json({"type": "started", "workflow_id": workflow_id})

    result = await execute_workflow(workflow_id, workflow_json, input_data)

    for log in result.node_logs:
        await ws.send_json({
            "type": "node_update",
            "node_id": log.node_id,
            "node_title": log.node_title,
            "status": log.status,
            "duration_ms": log.duration_ms,
            "output_preview": log.output_preview,
            "error_message": log.error_message,
            "tokens_used": log.tokens_used,
        })

    output = result.final_output
    if isinstance(output, (dict, list)):
        output = json.dumps(output)

    await ws.send_json({
        "type": "completed",
        "execution_id": result.execution_id,
        "status": result.status,
        "final_output": str(output) if output else None,
        "total_duration_ms": result.total_duration_ms,
        "total_tokens_used": result.total_tokens_used,
        "error_summary": result.error_summary,
    })

    await ws.close()
