import re
import json
from services.nodes.base import BaseNode, NodeOutput


class ConditionNode(BaseNode):
    node_type = "condition"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        first_input = next(iter(inputs.values()), None)
        data = first_input.data if hasattr(first_input, "data") else first_input if first_input else ""

        condition_type = self.config.get("conditionType", "contains")
        compare_value = self.config.get("compareValue", "")

        result = self._evaluate(data, condition_type, compare_value)

        return NodeOutput(
            data=data,
            output_type="text",
            metadata={"condition_result": result, "branch": "true" if result else "false"},
        )

    def _evaluate(self, data, condition_type: str, compare_value: str) -> bool:
        text = str(data) if data is not None else ""

        if condition_type == "contains":
            return compare_value.lower() in text.lower()
        elif condition_type == "equals":
            return text == compare_value
        elif condition_type == "greaterThan":
            try:
                return float(text) > float(compare_value)
            except (ValueError, TypeError):
                return False
        elif condition_type == "lessThan":
            try:
                return float(text) < float(compare_value)
            except (ValueError, TypeError):
                return False
        elif condition_type == "isEmpty":
            return not text.strip()
        elif condition_type == "isNotEmpty":
            return bool(text.strip())
        elif condition_type == "regex":
            return bool(re.search(compare_value, text))
        elif condition_type == "jsonFieldCheck":
            try:
                obj = json.loads(text) if isinstance(data, str) else data
                if isinstance(obj, dict):
                    for key in compare_value.split("."):
                        obj = obj.get(key)
                        if obj is None:
                            return False
                    return True
            except (json.JSONDecodeError, TypeError, AttributeError):
                return False
        elif condition_type == "custom":
            try:
                return bool(eval(compare_value, {"__builtins__": {}}, {"value": data, "text": text}))
            except Exception:
                return False

        return False
