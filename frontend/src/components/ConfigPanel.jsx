import { X } from 'lucide-react'
import { NODE_TYPES } from '../utils/nodeTypes'
import useWorkflowStore from '../store/workflowStore'

export default function ConfigPanel() {
  const selectedNode = useWorkflowStore(s => s.selectedNode)
  const nodes = useWorkflowStore(s => s.nodes)
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode)

  const node = nodes.find(n => n.id === selectedNode)

  if (!selectedNode || !node) {
    return null
  }

  const typeDef = NODE_TYPES[node.data.nodeType]
  if (!typeDef) return null

  const Icon = typeDef.icon

  return (
    <div
      className="w-[350px] flex-shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        background: '#252535',
        borderLeft: '1px solid #2A2A3C',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2A2A3C' }}>
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: typeDef.color }} />
          <span className="text-sm font-medium text-white">{node.data.title}</span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${typeDef.color}18` }}
          >
            <Icon size={24} style={{ color: typeDef.color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">{typeDef.label} Configuration</p>
            <p className="text-xs text-slate-500 mt-1">
              Node configuration panel coming in Block 2
            </p>
          </div>
          <div className="mt-4 text-left w-full p-3 rounded-lg" style={{ background: '#1E1E2E' }}>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Node Info</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ID</span>
                <span className="text-slate-300 font-mono">{node.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-300">{typeDef.label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <span className="text-slate-300">{node.data.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
