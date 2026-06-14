"""
MCP Server endpoint — exposes FlowPilot workflows as MCP tools.

Any MCP client (Claude Desktop, Cursor, etc.) can connect to this server
and call FlowPilot workflows as tools.
"""
import json

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from database import get_db
from services.workflow_engine import execute_workflow

router = APIRouter(prefix="/mcp", tags=["mcp"])


def _list_workflow_tools():
    db = get_db()
    rows = db.execute("SELECT id, name, description FROM workflows ORDER BY updated_at DESC").fetchall()
    db.close()

    tools = []
    for row in rows:
        tools.append({
            "name": f"workflow_{row['id'][:8]}",
            "description": f"Run workflow: {row['name']}. {row['description'] or ''}".strip(),
            "inputSchema": {
                "type": "object",
                "properties": {
                    "input": {
                        "type": "string",
                        "description": "Input data for the workflow",
                    }
                },
            },
            "_workflow_id": row["id"],
        })
    return tools


@router.post("")
async def mcp_endpoint(request: Request):
    body = await request.json()
    method = body.get("method")
    req_id = body.get("id")

    if method == "initialize":
        return JSONResponse({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {"listChanged": False}},
                "serverInfo": {
                    "name": "flowpilot",
                    "version": "1.0.0",
                },
            },
        })

    if method == "tools/list":
        tools = _list_workflow_tools()
        return JSONResponse({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": [
                    {
                        "name": t["name"],
                        "description": t["description"],
                        "inputSchema": t["inputSchema"],
                    }
                    for t in tools
                ],
            },
        })

    if method == "tools/call":
        params = body.get("params", {})
        tool_name = params.get("name", "")
        arguments = params.get("arguments", {})

        tools = _list_workflow_tools()
        matched = None
        for t in tools:
            if t["name"] == tool_name:
                matched = t
                break

        if not matched:
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32602, "message": f"Unknown tool: {tool_name}"},
            })

        workflow_id = matched["_workflow_id"]
        db = get_db()
        row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
        db.close()

        if not row:
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32602, "message": "Workflow not found"},
            })

        workflow_json = json.loads(row["workflow_json"])
        input_data = arguments.get("input", "")

        result = await execute_workflow(
            workflow_id=workflow_id,
            workflow_json=workflow_json,
            initial_input=input_data,
        )

        if result.status == "error":
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {"type": "text", "text": f"Workflow failed: {result.error_summary or 'Unknown error'}"}
                    ],
                    "isError": True,
                },
            })

        output = result.final_output or ""
        if isinstance(output, (dict, list)):
            output = json.dumps(output, indent=2)

        return JSONResponse({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [{"type": "text", "text": str(output)}],
            },
        })

    return JSONResponse({
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {"code": -32601, "message": f"Method not found: {method}"},
    })


@router.get("/info")
def mcp_info():
    tools = _list_workflow_tools()
    return {
        "server": "flowpilot",
        "version": "1.0.0",
        "protocol": "MCP 2024-11-05",
        "endpoint": "/mcp",
        "tools_available": len(tools),
        "tools": [
            {"name": t["name"], "description": t["description"]}
            for t in tools
        ],
    }
