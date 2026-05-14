from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class NodeOutput:
    data: Any = None
    output_type: str = "text"
    metadata: dict = field(default_factory=dict)
    error: Optional[str] = None


class BaseNode:
    node_type: str = "base"

    def __init__(self, config: dict):
        self.config = config

    async def execute(self, inputs: dict, context: Any) -> NodeOutput:
        raise NotImplementedError
