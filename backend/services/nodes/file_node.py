from services.nodes.base import BaseNode, NodeOutput


class FileNode(BaseNode):
    node_type = "file"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("File node execution — Block 2")
