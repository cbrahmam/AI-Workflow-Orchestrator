from services.nodes.base import BaseNode, NodeOutput


class OutputNode(BaseNode):
    node_type = "output"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("Output node execution — Block 2")
