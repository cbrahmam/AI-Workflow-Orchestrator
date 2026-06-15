"""
Plugin loader — discovers and loads custom node types from community-nodes/ directory.

Each plugin is a directory containing:
  - node.json — node definition (type, label, color, config schema)
  - executor.py — Python file with an execute(input_data, config) async function
"""
import json
import importlib.util
import sys
from pathlib import Path
from typing import Any

from services.nodes.base import BaseNode, NodeOutput

PLUGINS_DIR = Path(__file__).parent.parent.parent / "community-nodes"

_loaded_plugins: dict[str, dict] = {}


class PluginNode(BaseNode):
    def __init__(self, config: dict, executor_module):
        super().__init__(config)
        self._executor = executor_module

    async def execute(self, inputs: dict, context) -> NodeOutput:
        input_data = None
        for key, val in inputs.items():
            if hasattr(val, "data"):
                input_data = val.data
                break

        resolved_config = {}
        for key, val in self.config.items():
            if isinstance(val, str):
                resolved_config[key] = self.resolve_variables(val, context)
            else:
                resolved_config[key] = val

        try:
            result = await self._executor.execute(input_data, resolved_config)

            if isinstance(result, dict) and "error" in result:
                return NodeOutput(error=result["error"])

            return NodeOutput(
                data=result,
                output_type="json" if isinstance(result, (dict, list)) else "text",
                metadata=result.get("_metadata", {}) if isinstance(result, dict) else {},
            )
        except Exception as e:
            return NodeOutput(error=f"Plugin error: {str(e)}")


def load_plugins() -> dict[str, dict]:
    global _loaded_plugins

    if _loaded_plugins:
        return _loaded_plugins

    if not PLUGINS_DIR.exists():
        return {}

    for folder in sorted(PLUGINS_DIR.iterdir()):
        if not folder.is_dir():
            continue

        node_json = folder / "node.json"
        executor_py = folder / "executor.py"

        if not node_json.exists() or not executor_py.exists():
            continue

        try:
            with open(node_json) as f:
                definition = json.load(f)

            node_type = definition.get("type", folder.name)

            spec = importlib.util.spec_from_file_location(
                f"plugin_{node_type}", str(executor_py)
            )
            module = importlib.util.module_from_spec(spec)
            sys.modules[f"plugin_{node_type}"] = module
            spec.loader.exec_module(module)

            if not hasattr(module, "execute"):
                continue

            _loaded_plugins[node_type] = {
                "definition": definition,
                "module": module,
            }
        except Exception as e:
            print(f"Failed to load plugin {folder.name}: {e}")

    return _loaded_plugins


def get_plugin_executor(node_type: str, config: dict):
    plugins = load_plugins()
    plugin = plugins.get(node_type)
    if not plugin:
        return None
    return PluginNode(config, plugin["module"])


def get_plugin_definitions() -> list[dict]:
    plugins = load_plugins()
    return [
        {
            "type": node_type,
            "label": p["definition"].get("label", node_type),
            "category": p["definition"].get("category", "Plugin"),
            "color": p["definition"].get("color", "#F472B6"),
            "icon": p["definition"].get("icon", "Puzzle"),
            "description": p["definition"].get("description", "Custom plugin node"),
            "author": p["definition"].get("author", "community"),
            "configFields": p["definition"].get("configFields", []),
            "handles": p["definition"].get("handles", {"inputs": 1, "outputs": 1}),
        }
        for node_type, p in plugins.items()
    ]
