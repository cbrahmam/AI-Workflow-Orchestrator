from fastapi import APIRouter

from services.plugin_loader import get_plugin_definitions

router = APIRouter(prefix="/api/plugins", tags=["plugins"])


@router.get("")
def list_plugins():
    return get_plugin_definitions()
