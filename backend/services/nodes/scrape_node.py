from services.nodes.base import BaseNode, NodeOutput


class ScrapeNode(BaseNode):
    node_type = "scrape"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        raise NotImplementedError("Scrape node execution — Block 2")
