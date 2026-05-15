import json
from services.nodes.base import BaseNode, NodeOutput


class OutputNode(BaseNode):
    node_type = "output"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        output_type = self.config.get("outputType", "display")
        label = self.config.get("label", "Result")

        first_input = next(iter(inputs.values()), None)
        data = first_input.data if hasattr(first_input, "data") else first_input if first_input else ""

        if output_type == "json":
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except json.JSONDecodeError:
                    pass
            return NodeOutput(data=data, output_type="json", metadata={"label": label})

        elif output_type == "markdown":
            return NodeOutput(data=str(data), output_type="markdown", metadata={"label": label})

        elif output_type == "file":
            return NodeOutput(data=str(data), output_type="file", metadata={"label": label})

        return NodeOutput(data=str(data), output_type="text", metadata={"label": label})
