from services.nodes.llm_node import LLMNode
from services.nodes.transform_node import TransformNode
from services.nodes.api_node import APINode
from services.nodes.scrape_node import ScrapeNode
from services.nodes.condition_node import ConditionNode
from services.nodes.file_node import FileNode
from services.nodes.merge_node import MergeNode
from services.nodes.output_node import OutputNode

NODE_REGISTRY = {
    "llm": LLMNode,
    "transform": TransformNode,
    "api_call": APINode,
    "scrape": ScrapeNode,
    "condition": ConditionNode,
    "file": FileNode,
    "merge": MergeNode,
    "output": OutputNode,
}


def get_node_executor(node_type: str, config: dict):
    cls = NODE_REGISTRY.get(node_type)
    if not cls:
        return None
    return cls(config)
