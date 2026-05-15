import { X } from 'lucide-react'
import { NODE_TYPES } from '../utils/nodeTypes'
import useWorkflowStore from '../store/workflowStore'
import InputConfig from './config/InputConfig'
import LLMConfig from './config/LLMConfig'
import TransformConfig from './config/TransformConfig'
import APIConfig from './config/APIConfig'
import ScrapeConfig from './config/ScrapeConfig'
import ConditionConfig from './config/ConditionConfig'
import FileConfig from './config/FileConfig'
import MergeConfig from './config/MergeConfig'
import OutputConfig from './config/OutputConfig'

const CONFIG_COMPONENTS = {
  input: InputConfig,
  llm: LLMConfig,
  transform: TransformConfig,
  api_call: APIConfig,
  scrape: ScrapeConfig,
  condition: ConditionConfig,
  file: FileConfig,
  merge: MergeConfig,
  output: OutputConfig,
}

export default function ConfigPanel() {
  const selectedNode = useWorkflowStore(s => s.selectedNode)
  const nodes = useWorkflowStore(s => s.nodes)
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode)
  const updateNodeConfig = useWorkflowStore(s => s.updateNodeConfig)

  const node = nodes.find(n => n.id === selectedNode)
  if (!selectedNode || !node) return null

  const typeDef = NODE_TYPES[node.data.nodeType]
  if (!typeDef) return null

  const Icon = typeDef.icon
  const ConfigComponent = CONFIG_COMPONENTS[node.data.nodeType]

  const handleConfigChange = (newConfig) => {
    updateNodeConfig(node.id, newConfig)
  }

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
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} style={{ color: typeDef.color }} className="flex-shrink-0" />
          <span className="text-sm font-medium text-white truncate">{node.data.title}</span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {ConfigComponent && (
          <ConfigComponent
            nodeId={node.id}
            config={node.data.config || {}}
            onChange={handleConfigChange}
          />
        )}

        {/* Node Info */}
        <div className="mt-6 p-3 rounded-lg" style={{ background: '#1E1E2E' }}>
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
  )
}
