from services.nodes.llm_node import LLMNode
from services.nodes.transform_node import TransformNode
from services.nodes.api_node import APINode
from services.nodes.scrape_node import ScrapeNode
from services.nodes.condition_node import ConditionNode
from services.nodes.file_node import FileNode
from services.nodes.merge_node import MergeNode
from services.nodes.output_node import OutputNode
from services.nodes.mcp_node import MCPNode
from services.nodes.subworkflow_node import SubWorkflowNode
from services.nodes.ab_compare_node import ABCompareNode
from services.nodes.notify_node import NotifySlackNode, NotifyEmailNode, NotifyDiscordNode

NODE_REGISTRY = {
    "llm": LLMNode,
    "transform": TransformNode,
    "api_call": APINode,
    "scrape": ScrapeNode,
    "condition": ConditionNode,
    "file": FileNode,
    "merge": MergeNode,
    "output": OutputNode,
    "mcp_tool": MCPNode,
    "sub_workflow": SubWorkflowNode,
    "ab_compare": ABCompareNode,
    "notify_slack": NotifySlackNode,
    "notify_email": NotifyEmailNode,
    "notify_discord": NotifyDiscordNode,
}


def get_node_executor(node_type: str, config: dict):
    cls = NODE_REGISTRY.get(node_type)
    if cls:
        return cls(config)

    from services.plugin_loader import get_plugin_executor
    return get_plugin_executor(node_type, config)
