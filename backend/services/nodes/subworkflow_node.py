import json
from services.nodes.base import BaseNode, NodeOutput


class SubWorkflowNode(BaseNode):
    node_type = "sub_workflow"

    async def execute(self, inputs: dict, context) -> NodeOutput:
        workflow_id = self.config.get("workflowId", "")
        if not workflow_id:
            return NodeOutput(error="No workflow selected")

        from database import get_db
        db = get_db()
        row = db.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
        db.close()

        if not row:
            return NodeOutput(error=f"Workflow {workflow_id} not found")

        workflow_json = json.loads(row["workflow_json"])

        input_data = None
        for key, val in inputs.items():
            if hasattr(val, "data"):
                input_data = val.data
                break

        from services.workflow_engine import execute_workflow
        result = await execute_workflow(workflow_id, workflow_json, input_data)

        if result.status in ("failed", "error"):
            return NodeOutput(
                error=f"Sub-workflow failed: {result.error_summary or 'Unknown error'}",
                metadata={"sub_execution_id": result.execution_id},
            )

        return NodeOutput(
            data=result.final_output,
            output_type="json" if isinstance(result.final_output, (dict, list)) else "text",
            metadata={
                "sub_execution_id": result.execution_id,
                "sub_duration_ms": result.total_duration_ms,
                "sub_tokens_used": result.total_tokens_used,
                "tokens_used": result.total_tokens_used,
            },
        )
