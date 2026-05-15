import { getUpstreamVariables } from '../../utils/validators'
import { NODE_TYPES } from '../../utils/nodeTypes'
import useWorkflowStore from '../../store/workflowStore'

export default function VariableChips({ nodeId, onInsert }) {
  const nodes = useWorkflowStore(s => s.nodes)
  const edges = useWorkflowStore(s => s.edges)

  const variables = getUpstreamVariables(nodeId, nodes, edges)

  if (variables.length === 0) return null

  return (
    <div className="mt-1.5">
      <p className="text-[10px] text-slate-500 mb-1">Available variables (click to insert)</p>
      <div className="flex flex-wrap gap-1">
        {variables.map(v => {
          const color = NODE_TYPES[v.type]?.color || '#6B7280'
          return (
            <button
              key={v.nodeId}
              type="button"
              onClick={() => onInsert(v.variable)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors hover:brightness-125 cursor-pointer"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {v.variable}
            </button>
          )
        })}
      </div>
    </div>
  )
}
