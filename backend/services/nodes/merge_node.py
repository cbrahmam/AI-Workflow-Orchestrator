import json
from services.nodes.base import BaseNode, NodeOutput


class MergeNode(BaseNode):
    node_type = "merge"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        strategy = self.config.get("strategy", "concatenate")
        input_values = []
        for inp in inputs.values():
            if hasattr(inp, "data"):
                input_values.append(inp.data)
            else:
                input_values.append(inp)

        if strategy == "concatenate":
            separator = self.config.get("separator", "\n")
            separator = separator.replace("\\n", "\n").replace("\\t", "\t")
            result = separator.join(str(v) for v in input_values)
            return NodeOutput(data=result, output_type="text")

        elif strategy == "jsonMerge":
            merged = {}
            for v in input_values:
                if isinstance(v, dict):
                    merged.update(v)
                elif isinstance(v, str):
                    try:
                        merged.update(json.loads(v))
                    except (json.JSONDecodeError, TypeError):
                        pass
            return NodeOutput(data=merged, output_type="json")

        elif strategy == "arrayCollect":
            return NodeOutput(data=input_values, output_type="array")

        elif strategy == "template":
            template = self.config.get("template", "")
            result = self.resolve_variables(template, context)
            return NodeOutput(data=result, output_type="text")

        return NodeOutput(error=f"Unknown merge strategy: {strategy}")
