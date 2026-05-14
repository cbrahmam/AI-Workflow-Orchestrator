from services.nodes.base import BaseNode, NodeOutput


class ConditionNode(BaseNode):
    node_type = "condition"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("Condition node execution — Block 2")
