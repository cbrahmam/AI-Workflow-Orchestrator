import json
import csv
import io
from services.nodes.base import BaseNode, NodeOutput


class FileNode(BaseNode):
    node_type = "file"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        operation = self.config.get("operation", "read")
        file_type = self.config.get("fileType", "txt")

        if operation == "read":
            return await self._read(inputs, file_type)
        elif operation == "write":
            return await self._write(inputs, context)
        else:
            return NodeOutput(error=f"Unknown operation: {operation}")

    async def _read(self, inputs, file_type) -> NodeOutput:
        first_input = next(iter(inputs.values()), None)
        if not first_input:
            return NodeOutput(error="No file input provided")

        data = first_input.data if hasattr(first_input, "data") else first_input
        content = str(data)

        if file_type == "json":
            try:
                parsed = json.loads(content)
                return NodeOutput(data=parsed, output_type="json")
            except json.JSONDecodeError as e:
                return NodeOutput(error=f"Invalid JSON: {e}")

        elif file_type == "csv":
            reader = csv.DictReader(io.StringIO(content))
            rows = [dict(row) for row in reader]
            return NodeOutput(data=rows, output_type="json")

        elif file_type == "pdf":
            return NodeOutput(data=content, output_type="text", metadata={"note": "PDF text extraction"})

        return NodeOutput(data=content, output_type="text")

    async def _write(self, inputs, context) -> NodeOutput:
        first_input = next(iter(inputs.values()), None)
        data = first_input.data if hasattr(first_input, "data") else first_input if first_input else ""

        filename = self.resolve_variables(self.config.get("filename", "output.txt"), context)
        file_type = self.config.get("fileType", "txt")

        if file_type == "json" and not isinstance(data, str):
            content = json.dumps(data, indent=2)
        elif file_type == "csv" and isinstance(data, list):
            output = io.StringIO()
            if data and isinstance(data[0], dict):
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            content = output.getvalue()
        else:
            content = str(data)

        return NodeOutput(
            data=content,
            output_type="file",
            metadata={"filename": filename, "file_type": file_type, "size_bytes": len(content)},
        )
