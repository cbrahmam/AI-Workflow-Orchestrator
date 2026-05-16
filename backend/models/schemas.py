from typing import Any, Optional
from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    name: str
    description: str = ""
    workflow_json: dict[str, Any] = {}


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    workflow_json: Optional[dict[str, Any]] = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: str
    workflow_json: dict[str, Any]
    created_at: str
    updated_at: str


class ExecuteRequest(BaseModel):
    input: Any = None


class NodeExecutionLog(BaseModel):
    node_id: str
    node_type: str
    node_title: str
    status: str = "pending"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_ms: Optional[int] = None
    input_preview: Optional[str] = None
    output_preview: Optional[str] = None
    error_message: Optional[str] = None
    tokens_used: Optional[int] = None


class ExecutionResult(BaseModel):
    execution_id: str
    workflow_id: str
    status: str = "running"
    started_at: str
    completed_at: Optional[str] = None
    total_duration_ms: Optional[int] = None
    node_logs: list[NodeExecutionLog] = []
    final_output: Any = None
    total_tokens_used: int = 0
    total_api_calls: int = 0
    error_summary: Optional[str] = None
