import re
import time
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class NodeOutput:
    data: Any = None
    output_type: str = "text"
    metadata: dict = field(default_factory=dict)
    error: Optional[str] = None


class ExecutionContext:
    def __init__(self, workflow_id: str, execution_id: str, api_keys: dict = None):
        self.workflow_id = workflow_id
        self.execution_id = execution_id
        self.node_outputs: dict[str, NodeOutput] = {}
        self.variables: dict[str, Any] = {}
        self.api_keys = api_keys or {}
        self.start_time = time.time()


class BaseNode:
    node_type: str = "base"

    def __init__(self, config: dict):
        self.config = config

    async def execute(self, inputs: dict, context: ExecutionContext) -> NodeOutput:
        raise NotImplementedError

    def resolve_variables(self, template: str, context: ExecutionContext) -> str:
        if not template or not isinstance(template, str):
            return template or ""

        def replacer(match):
            var_path = match.group(1).strip()
            parts = var_path.split(".")
            for node_id, output in context.node_outputs.items():
                node_title = context.variables.get(f"_title_{node_id}", node_id)
                if parts[0] in (node_id, node_title):
                    value = output.data
                    for part in parts[1:]:
                        if part == "output":
                            continue
                        if isinstance(value, dict):
                            value = value.get(part, "")
                        else:
                            break
                    return str(value) if value is not None else ""
            return match.group(0)

        return re.sub(r"\{\{(.+?)\}\}", replacer, template)
