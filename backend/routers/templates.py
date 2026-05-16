import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES_PATH = Path(__file__).parent.parent.parent / "sample-workflows" / "templates.json"

_templates_cache = None


def _load_templates():
    global _templates_cache
    if _templates_cache is None:
        with open(TEMPLATES_PATH) as f:
            _templates_cache = json.load(f)
    return _templates_cache


@router.get("")
def list_templates():
    templates = _load_templates()
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "category": t["category"],
            "node_count": t["node_count"],
        }
        for t in templates
    ]


@router.get("/{template_id}")
def get_template(template_id: str):
    templates = _load_templates()
    for t in templates:
        if t["id"] == template_id:
            return t
    raise HTTPException(status_code=404, detail="Template not found")


@router.post("/{template_id}/use")
def use_template(template_id: str):
    templates = _load_templates()
    template = None
    for t in templates:
        if t["id"] == template_id:
            template = t
            break
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db = get_db()
    workflow_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    name = template["name"]
    workflow_json = json.dumps(template["workflow_json"])

    db.execute(
        "INSERT INTO workflows (id, name, description, workflow_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (workflow_id, name, template["description"], workflow_json, now, now),
    )
    db.commit()
    db.close()

    return {"id": workflow_id, "name": name}
