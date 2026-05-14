from services.nodes.base import BaseNode, NodeOutput


class TransformNode(BaseNode):
    node_type = "transform"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("Transform node execution — Block 2")
