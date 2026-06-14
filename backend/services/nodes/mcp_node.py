import json
import time
import httpx
from services.nodes.base import BaseNode, NodeOutput


class MCPNode(BaseNode):
    node_type = "mcp_tool"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        server_url = self.resolve_variables(self.config.get("serverUrl", ""), context)
        tool_name = self.resolve_variables(self.config.get("toolName", ""), context)
        tool_args_raw = self.resolve_variables(self.config.get("toolArgs", "{}"), context)

        if not server_url:
            return NodeOutput(error="MCP server URL is required")
        if not tool_name:
            return NodeOutput(error="Tool name is required")

        try:
            tool_args = json.loads(tool_args_raw) if tool_args_raw else {}
        except json.JSONDecodeError:
            tool_args = {"input": tool_args_raw}

        input_data = inputs.get("default") or inputs.get("input-0")
        if input_data and not tool_args:
            tool_args = {"input": str(input_data)}

        start = time.time()

        request_body = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": tool_args,
            },
        }

        headers = {"Content-Type": "application/json"}
        auth_header = self.config.get("authHeader", "")
        if auth_header:
            headers["Authorization"] = auth_header

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(server_url, json=request_body, headers=headers)

        duration = time.time() - start

        if response.status_code != 200:
            return NodeOutput(
                error=f"MCP server returned {response.status_code}: {response.text}",
                metadata={"status_code": response.status_code, "duration_s": round(duration, 2)},
            )

        try:
            result = response.json()
        except Exception:
            return NodeOutput(data=response.text, output_type="text")

        if "error" in result:
            return NodeOutput(
                error=f"MCP error: {result['error'].get('message', str(result['error']))}",
                metadata={"duration_s": round(duration, 2)},
            )

        content = result.get("result", {}).get("content", [])
        if content:
            text_parts = [c.get("text", "") for c in content if c.get("type") == "text"]
            data = "\n".join(text_parts) if text_parts else content
        else:
            data = result.get("result", result)

        return NodeOutput(
            data=data,
            output_type="json" if isinstance(data, (dict, list)) else "text",
            metadata={"tool": tool_name, "duration_s": round(duration, 2)},
        )
