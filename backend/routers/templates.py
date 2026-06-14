import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES_PATH = Path(__file__).parent.parent.parent / "sample-workflows" / "templates.json"
COMMUNITY_PATH = Path(__file__).parent.parent.parent / "community-templates"

_templates_cache = None
_community_cache = None


def _load_templates():
    global _templates_cache
    if _templates_cache is None:
        with open(TEMPLATES_PATH) as f:
            _templates_cache = json.load(f)
    return _templates_cache


def _load_community_templates():
    global _community_cache
    if _community_cache is None:
        _community_cache = []
        if COMMUNITY_PATH.exists():
            for folder in sorted(COMMUNITY_PATH.iterdir()):
                template_file = folder / "template.json"
                if folder.is_dir() and template_file.exists():
                    with open(template_file) as f:
                        data = json.load(f)
                    data["id"] = f"community-{folder.name}"
                    data["source"] = "community"
                    data["node_count"] = len(data.get("nodes", []))
                    _community_cache.append(data)
    return _community_cache


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


@router.get("/community")
def list_community_templates():
    templates = _load_community_templates()
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "category": t.get("category", "general"),
            "author": t.get("author", "anonymous"),
            "tags": t.get("tags", []),
            "node_count": t["node_count"],
            "source": "community",
        }
        for t in templates
    ]


@router.get("/{template_id}")
def get_template(template_id: str):
    templates = _load_templates()
    for t in templates:
        if t["id"] == template_id:
            return t
    community = _load_community_templates()
    for t in community:
        if t["id"] == template_id:
            return t
    raise HTTPException(status_code=404, detail="Template not found")


@router.post("/{template_id}/use")
def use_template(template_id: str):
    template = None
    for t in _load_templates():
        if t["id"] == template_id:
            template = t
            break
    if not template:
        for t in _load_community_templates():
            if t["id"] == template_id:
                template = t
                break
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db = get_db()
    workflow_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    name = template["name"]

    if "workflow_json" in template:
        workflow_json = json.dumps(template["workflow_json"])
    else:
        workflow_json = json.dumps({"nodes": template.get("nodes", []), "edges": template.get("edges", [])})

    db.execute(
        "INSERT INTO workflows (id, name, description, workflow_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (workflow_id, name, template["description"], workflow_json, now, now),
    )
    db.commit()
    db.close()

    return {"id": workflow_id, "name": name}
