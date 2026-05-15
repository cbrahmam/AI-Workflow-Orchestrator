import re
import json
import csv
import io
from services.nodes.base import BaseNode, NodeOutput


class TransformNode(BaseNode):
    node_type = "transform"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        operation = self.config.get("operation", "template")
        first_input = next(iter(inputs.values()), None)
        data = first_input.data if hasattr(first_input, "data") else first_input if first_input else ""

        try:
            if operation == "extractJson":
                return self._extract_json(data)
            elif operation == "splitText":
                return self._split_text(data)
            elif operation == "joinTexts":
                return self._join_texts(data)
            elif operation == "regexExtract":
                return self._regex_extract(data)
            elif operation == "template":
                return self._template(context)
            elif operation == "parseCsv":
                return self._parse_csv(data)
            elif operation == "filterArray":
                return self._filter_array(data)
            elif operation == "mapArray":
                return self._map_array(data)
            else:
                return NodeOutput(error=f"Unknown operation: {operation}")
        except Exception as e:
            return NodeOutput(error=str(e))

    def _extract_json(self, data) -> NodeOutput:
        json_path = self.config.get("jsonPath", "")
        if isinstance(data, str):
            data = json.loads(data)
        value = data
        for key in json_path.split("."):
            key = key.strip()
            if not key:
                continue
            if isinstance(value, dict):
                value = value.get(key)
            elif isinstance(value, list):
                value = value[int(key)]
            else:
                break
        return NodeOutput(data=value, output_type="json" if isinstance(value, (dict, list)) else "text")

    def _split_text(self, data) -> NodeOutput:
        delimiter = self.config.get("delimiter", "\n")
        delimiter = delimiter.replace("\\n", "\n").replace("\\t", "\t")
        parts = str(data).split(delimiter)
        return NodeOutput(data=parts, output_type="array")

    def _join_texts(self, data) -> NodeOutput:
        separator = self.config.get("delimiter", "\n")
        separator = separator.replace("\\n", "\n").replace("\\t", "\t")
        if isinstance(data, list):
            result = separator.join(str(item) for item in data)
        else:
            result = str(data)
        return NodeOutput(data=result, output_type="text")

    def _regex_extract(self, data) -> NodeOutput:
        pattern = self.config.get("regex", "")
        matches = re.findall(pattern, str(data))
        if len(matches) == 1:
            return NodeOutput(data=matches[0], output_type="text")
        return NodeOutput(data=matches, output_type="array")

    def _template(self, context) -> NodeOutput:
        template = self.config.get("template", "")
        result = self.resolve_variables(template, context)
        return NodeOutput(data=result, output_type="text")

    def _parse_csv(self, data) -> NodeOutput:
        reader = csv.DictReader(io.StringIO(str(data)))
        rows = [dict(row) for row in reader]
        return NodeOutput(data=rows, output_type="json")

    def _filter_array(self, data) -> NodeOutput:
        condition = self.config.get("filterCondition", "")
        if not isinstance(data, list):
            return NodeOutput(error="Input must be an array")
        filtered = []
        for item in data:
            try:
                if eval(condition, {"__builtins__": {}}, {"item": item}):
                    filtered.append(item)
            except Exception:
                pass
        return NodeOutput(data=filtered, output_type="array")

    def _map_array(self, data) -> NodeOutput:
        expression = self.config.get("mapExpression", "")
        if not isinstance(data, list):
            return NodeOutput(error="Input must be an array")
        mapped = []
        for item in data:
            try:
                result = eval(expression, {"__builtins__": {}}, {"item": item})
                mapped.append(result)
            except Exception:
                mapped.append(None)
        return NodeOutput(data=mapped, output_type="array")
