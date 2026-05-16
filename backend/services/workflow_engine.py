import asyncio
import json
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Optional

from config import settings
from database import get_db
from models.schemas import NodeExecutionLog, ExecutionResult
from services.node_registry import get_node_executor
from services.nodes.base import ExecutionContext, NodeOutput

NODE_TIMEOUT = 60
WORKFLOW_TIMEOUT = 300

_cancelled: set[str] = set()


def cancel_execution(execution_id: str):
    _cancelled.add(execution_id)


def is_cancelled(execution_id: str) -> bool:
    return execution_id in _cancelled


async def execute_workflow(
    workflow_id: str,
    workflow_json: dict,
    initial_input: Any = None,
) -> ExecutionResult:
    execution_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    nodes = workflow_json.get("nodes", [])
    edges = workflow_json.get("edges", [])

    node_map = {n["id"]: n for n in nodes}

    node_logs: dict[str, NodeExecutionLog] = {}
    for n in nodes:
        node_logs[n["id"]] = NodeExecutionLog(
            node_id=n["id"],
            node_type=n.get("data", {}).get("nodeType", n.get("type", "")),
            node_title=n.get("data", {}).get("title", n["id"]),
            status="pending",
        )

    result = ExecutionResult(
        execution_id=execution_id,
        workflow_id=workflow_id,
        status="running",
        started_at=now,
        node_logs=list(node_logs.values()),
    )

    _save_execution(result)

    api_keys = {
        "ANTHROPIC_API_KEY": settings.ANTHROPIC_API_KEY,
        "OPENAI_API_KEY": settings.OPENAI_API_KEY,
    }
    context = ExecutionContext(workflow_id, execution_id, api_keys)

    for n in nodes:
        context.variables[f"_title_{n['id']}"] = n.get("data", {}).get("title", n["id"])

    try:
        layers = build_execution_dag(nodes, edges)
    except ValueError as e:
        result.status = "failed"
        result.error_summary = str(e)
        result.completed_at = datetime.now(timezone.utc).isoformat()
        result.total_duration_ms = _elapsed_ms(result.started_at)
        _save_execution(result)
        return result

    adj = defaultdict(list)
    for e in edges:
        adj[e["source"]].append(e)

    incoming = defaultdict(list)
    for e in edges:
        incoming[e["target"]].append(e)

    skipped_nodes: set[str] = set()
    total_tokens = 0
    total_api_calls = 0
    final_output = None
    workflow_start = time.time()

    for layer in layers:
        for node_id in layer:
            if is_cancelled(execution_id):
                _mark_remaining(node_logs, layer, node_id, skipped_nodes, "skipped")
                result.status = "cancelled"
                break

            if time.time() - workflow_start > WORKFLOW_TIMEOUT:
                _mark_remaining(node_logs, layer, node_id, skipped_nodes, "skipped")
                result.status = "failed"
                result.error_summary = "Workflow timeout exceeded (5 minutes)"
                break

            if node_id in skipped_nodes:
                node_logs[node_id].status = "skipped"
                continue

            node_data = node_map[node_id]
            node_type = node_data.get("data", {}).get("nodeType", node_data.get("type", ""))
            config = node_data.get("data", {}).get("config", {})

            if node_type == "input":
                input_data = initial_input
                if input_data is None:
                    input_data = config.get("defaultValue", "")
                output = NodeOutput(data=input_data, output_type="text")
                context.node_outputs[node_id] = output
                log = node_logs[node_id]
                log.status = "success"
                log.started_at = datetime.now(timezone.utc).isoformat()
                log.completed_at = log.started_at
                log.duration_ms = 0
                log.output_preview = _preview(output.data)
                result.node_logs = list(node_logs.values())
                _save_execution(result)
                continue

            executor = get_node_executor(node_type, config)
            if not executor:
                node_logs[node_id].status = "error"
                node_logs[node_id].error_message = f"No executor for type: {node_type}"
                _skip_downstream(node_id, adj, skipped_nodes)
                result.status = "failed"
                result.error_summary = f"No executor for node type: {node_type}"
                result.node_logs = list(node_logs.values())
                _save_execution(result)
                continue

            node_inputs = {}
            for edge in incoming.get(node_id, []):
                source_id = edge["source"]
                if source_id in context.node_outputs:
                    handle_id = edge.get("targetHandle", "default")
                    node_inputs[handle_id] = context.node_outputs[source_id]

            log = node_logs[node_id]
            log.status = "running"
            log.started_at = datetime.now(timezone.utc).isoformat()
            result.node_logs = list(node_logs.values())
            _save_execution(result)

            log.input_preview = _preview(
                {k: v.data for k, v in node_inputs.items()} if node_inputs else None
            )

            retries = 1 if node_type in ("llm", "api_call") else 0
            output = None

            for attempt in range(retries + 1):
                try:
                    output = await asyncio.wait_for(
                        executor.execute(node_inputs, context),
                        timeout=NODE_TIMEOUT,
                    )
                    if output.error and attempt < retries:
                        continue
                    break
                except asyncio.TimeoutError:
                    if attempt < retries:
                        continue
                    output = NodeOutput(error=f"Node timed out after {NODE_TIMEOUT}s")
                    break
                except Exception as exc:
                    if attempt < retries:
                        continue
                    output = NodeOutput(error=str(exc))
                    break

            log.completed_at = datetime.now(timezone.utc).isoformat()
            log.duration_ms = _elapsed_ms(log.started_at)

            if output.error:
                log.status = "error"
                log.error_message = output.error
                _skip_downstream(node_id, adj, skipped_nodes)
                result.status = "failed"
                result.error_summary = f"{log.node_title}: {output.error}"
            else:
                log.status = "success"
                log.output_preview = _preview(output.data)
                context.node_outputs[node_id] = output

                tokens = output.metadata.get("tokens_used", 0)
                if tokens:
                    log.tokens_used = tokens
                    total_tokens += tokens

                if node_type in ("llm", "api_call", "scrape"):
                    total_api_calls += 1

                if node_type == "condition":
                    branch = output.metadata.get("branch", "true")
                    for edge in adj.get(node_id, []):
                        source_handle = edge.get("sourceHandle", "")
                        if source_handle and source_handle != branch:
                            _skip_downstream_from_edge(edge["target"], adj, skipped_nodes, node_map, node_logs)

                if node_type == "output":
                    final_output = output.data

            result.node_logs = list(node_logs.values())
            _save_execution(result)

        if result.status in ("failed", "cancelled"):
            break

    if result.status == "running":
        result.status = "completed"

    result.completed_at = datetime.now(timezone.utc).isoformat()
    result.total_duration_ms = _elapsed_ms(result.started_at)
    result.final_output = final_output
    result.total_tokens_used = total_tokens
    result.total_api_calls = total_api_calls
    result.node_logs = list(node_logs.values())

    _save_execution(result)
    _cancelled.discard(execution_id)

    return result


def build_execution_dag(nodes: list, edges: list) -> list[list[str]]:
    node_ids = {n["id"] for n in nodes}
    in_degree = {nid: 0 for nid in node_ids}
    adj = defaultdict(list)

    for e in edges:
        src, tgt = e["source"], e["target"]
        if src in node_ids and tgt in node_ids:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    layers = []
    visited = 0

    while queue:
        layers.append(list(queue))
        visited += len(queue)
        next_queue = []
        for nid in queue:
            for neighbor in adj[nid]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    next_queue.append(neighbor)
        queue = next_queue

    if visited != len(node_ids):
        raise ValueError("Workflow contains circular dependencies")

    return layers


def _skip_downstream(node_id: str, adj: dict, skipped: set):
    for edge in adj.get(node_id, []):
        target = edge["target"]
        if target not in skipped:
            skipped.add(target)
            _skip_downstream(target, adj, skipped)


def _skip_downstream_from_edge(target_id: str, adj: dict, skipped: set, node_map: dict, node_logs: dict):
    if target_id not in skipped:
        skipped.add(target_id)
        if target_id in node_logs:
            node_logs[target_id].status = "skipped"
        _skip_downstream(target_id, adj, skipped)


def _mark_remaining(node_logs, layer, current_id, skipped, status):
    found = False
    for nid in layer:
        if nid == current_id:
            found = True
        if found and nid not in skipped:
            node_logs[nid].status = status
            skipped.add(nid)


def _preview(data, max_len=500) -> Optional[str]:
    if data is None:
        return None
    text = json.dumps(data) if isinstance(data, (dict, list)) else str(data)
    return text[:max_len] if len(text) > max_len else text


def _elapsed_ms(start_iso: str) -> int:
    start = datetime.fromisoformat(start_iso)
    now = datetime.now(timezone.utc)
    return int((now - start).total_seconds() * 1000)


def _save_execution(result: ExecutionResult):
    db = get_db()
    row = db.execute("SELECT id FROM executions WHERE id = ?", (result.execution_id,)).fetchone()
    data = result.model_dump()
    node_logs_json = json.dumps([log.model_dump() for log in result.node_logs])
    final_output_json = json.dumps(data.get("final_output"))

    if row:
        db.execute(
            """UPDATE executions SET status=?, completed_at=?, total_duration_ms=?,
               node_logs=?, final_output=?, total_tokens=?, error_summary=? WHERE id=?""",
            (
                result.status,
                result.completed_at,
                result.total_duration_ms,
                node_logs_json,
                final_output_json,
                result.total_tokens_used,
                result.error_summary,
                result.execution_id,
            ),
        )
    else:
        db.execute(
            """INSERT INTO executions (id, workflow_id, status, started_at, completed_at,
               total_duration_ms, node_logs, final_output, total_tokens, error_summary)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                result.execution_id,
                result.workflow_id,
                result.status,
                result.started_at,
                result.completed_at,
                result.total_duration_ms,
                node_logs_json,
                final_output_json,
                result.total_tokens_used,
                result.error_summary,
            ),
        )
    db.commit()
    db.close()
