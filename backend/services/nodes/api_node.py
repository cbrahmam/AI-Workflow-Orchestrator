import json
import time
import httpx
from services.nodes.base import BaseNode, NodeOutput


class APINode(BaseNode):
    node_type = "api_call"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        method = self.config.get("method", "GET")
        url = self.resolve_variables(self.config.get("url", ""), context)
        body = self.resolve_variables(self.config.get("body", ""), context)
        auth_type = self.config.get("authType", "none")
        auth_value = self.config.get("authValue", "")
        response_handling = self.config.get("responseHandling", "full")

        if not url:
            return NodeOutput(error="URL is required")

        headers = {}
        for h in self.config.get("headers", []):
            if h.get("key"):
                headers[h["key"]] = self.resolve_variables(h.get("value", ""), context)

        if auth_type == "bearer":
            headers["Authorization"] = f"Bearer {auth_value}"
        elif auth_type == "apiKey":
            headers["X-API-Key"] = auth_value

        auth = None
        if auth_type == "basic" and ":" in auth_value:
            parts = auth_value.split(":", 1)
            auth = (parts[0], parts[1])

        start = time.time()

        async with httpx.AsyncClient(timeout=30) as client:
            kwargs = {"method": method, "url": url, "headers": headers}
            if auth:
                kwargs["auth"] = auth
            if method in ("POST", "PUT") and body:
                try:
                    kwargs["json"] = json.loads(body)
                except (json.JSONDecodeError, TypeError):
                    kwargs["content"] = body
                    headers.setdefault("Content-Type", "text/plain")

            response = await client.request(**kwargs)

        duration = time.time() - start

        if response_handling == "statusOnly":
            return NodeOutput(
                data=response.status_code,
                output_type="text",
                metadata={"status_code": response.status_code, "duration_s": round(duration, 2)},
            )

        try:
            data = response.json()
        except Exception:
            data = response.text

        if response_handling == "jsonPath":
            json_path = self.config.get("responsePath", "")
            if json_path and isinstance(data, dict):
                for key in json_path.split("."):
                    if isinstance(data, dict):
                        data = data.get(key)
                    elif isinstance(data, list):
                        data = data[int(key)]

        return NodeOutput(
            data=data,
            output_type="json" if isinstance(data, (dict, list)) else "text",
            metadata={"status_code": response.status_code, "duration_s": round(duration, 2)},
        )
