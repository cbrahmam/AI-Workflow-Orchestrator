from services.nodes.base import BaseNode, NodeOutput


class LLMNode(BaseNode):
    node_type = "llm"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("LLM node execution — Block 2")
