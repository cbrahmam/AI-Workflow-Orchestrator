from services.nodes.base import BaseNode, NodeOutput


class APINode(BaseNode):
    node_type = "api_call"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("API node execution — Block 2")
