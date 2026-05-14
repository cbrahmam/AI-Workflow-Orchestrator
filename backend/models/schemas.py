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
