from services.nodes.base import BaseNode, NodeOutput


class MergeNode(BaseNode):
    node_type = "merge"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("Merge node execution — Block 2")
