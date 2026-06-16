import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import settings
from database import get_db

router = APIRouter(prefix="/api/generate", tags=["generate"])

SYSTEM_PROMPT = """You are FlowPilot's workflow generator. Given a natural language description, you produce a valid workflow JSON.

Available node types:
- input: Workflow starting point. Config: {inputType: "text", defaultValue: ""}
- llm: Call an AI model. Config: {provider: "claude", model: "claude-sonnet-4-20250514", systemPrompt: "", userPrompt: "", temperature: 0.7, maxTokens: 1024}
- transform: Reshape data. Config: {operation: "template"|"split"|"join"|"jsonPath"|"regex", template: "", delimiter: "", jsonPath: "", regex: ""}
- api_call: HTTP request. Config: {method: "GET"|"POST", url: "", headers: [], body: "", authType: "none", responseHandling: "full"}
- scrape: Extract web content. Config: {url: "", extractionType: "fullText"|"selector", selector: ""}
- condition: Branch on condition. Config: {conditionType: "contains"|"equals"|"length"|"regex", compareValue: ""}. Has two output handles: "true" and "false"
- merge: Combine inputs. Config: {strategy: "concatenate"|"jsonMerge"|"array"|"template", separator: "\\n"}. Has two input handles: "input-0" and "input-1"
- file: Read/write files. Config: {operation: "read"|"write", fileType: "txt"|"json"|"csv", filename: ""}
- output: Display results. Config: {outputType: "display", label: "Result"}
- notify_slack: Send to Slack. Config: {webhookUrl: "", channel: "", username: "FlowPilot"}
- notify_email: Send email. Config: {to: "", subject: "", smtpHost: "", smtpPort: 587}
- notify_discord: Send to Discord. Config: {webhookUrl: ""}

Rules:
- Use the {{Node Title.output}} syntax to reference other nodes' outputs in prompts/templates
- Every workflow needs at least an Input and Output node
- Position nodes left-to-right: x increments by 300, y stays around 200 unless branching
- Give nodes clear, descriptive titles
- Return ONLY valid JSON, no markdown or explanation

Output format:
{
  "name": "Workflow Name",
  "description": "One-line description",
  "nodes": [
    {"id": "node_1", "type": "input", "position": {"x": 100, "y": 200}, "data": {"title": "User Input", "nodeType": "input", "status": "idle", "config": {...}, "configPreview": "text"}}
  ],
  "edges": [
    {"id": "e1", "source": "node_1", "target": "node_2", "animated": true, "type": "smoothstep", "style": {"stroke": "#555", "strokeDasharray": "5 5"}}
  ]
}"""


class GenerateRequest(BaseModel):
    prompt: str
    save: bool = True


@router.post("")
async def generate_workflow(payload: GenerateRequest):
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        temperature=0.3,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Create a workflow for: {payload.prompt}"}],
    )

    text = response.content[0].text.strip()

    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        workflow_data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse generated workflow")

    name = workflow_data.get("name", "Generated Workflow")
    description = workflow_data.get("description", payload.prompt)
    nodes = workflow_data.get("nodes", [])
    edges = workflow_data.get("edges", [])

    result = {
        "name": name,
        "description": description,
        "workflow_json": {"nodes": nodes, "edges": edges},
        "prompt": payload.prompt,
    }

    if payload.save:
        db = get_db()
        workflow_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        db.execute(
            "INSERT INTO workflows (id, name, description, workflow_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (workflow_id, name, description, json.dumps({"nodes": nodes, "edges": edges}), now, now),
        )
        db.commit()
        db.close()
        result["id"] = workflow_id

    return result
