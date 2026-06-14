import { useState } from 'react'
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
import MCPConfig from './config/MCPConfig'

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
  mcp_tool: MCPConfig,
}

export default function ConfigPanel() {
  const selectedNode = useWorkflowStore(s => s.selectedNode)
  const nodes = useWorkflowStore(s => s.nodes)
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode)
  const updateNodeConfig = useWorkflowStore(s => s.updateNodeConfig)
  const executionResult = useWorkflowStore(s => s.executionResult)

  const [activeTab, setActiveTab] = useState('config')

  const node = nodes.find(n => n.id === selectedNode)
  if (!selectedNode || !node) return null

  const typeDef = NODE_TYPES[node.data.nodeType]
  if (!typeDef) return null

  const Icon = typeDef.icon
  const ConfigComponent = CONFIG_COMPONENTS[node.data.nodeType]

  const handleConfigChange = (newConfig) => {
    updateNodeConfig(node.id, newConfig)
  }

  const nodeLog = executionResult?.node_logs?.find(l => l.node_id === node.id)
  const hasOutput = nodeLog && (nodeLog.output_preview || nodeLog.error_message)

  return (
    <div
      className="w-[350px] flex-shrink-0 h-full flex flex-col overflow-hidden animate-slide-in-right"
      style={{ background: '#252535', borderLeft: '1px solid #2A2A3C' }}
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

      {/* Tabs */}
      {hasOutput && (
        <div className="flex items-center gap-1 px-4 pt-2 border-b" style={{ borderColor: '#2A2A3C' }}>
          <button
            onClick={() => setActiveTab('config')}
            className={`text-xs font-medium px-2 py-1.5 rounded-t transition-colors ${
              activeTab === 'config' ? 'text-white bg-white/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`text-xs font-medium px-2 py-1.5 rounded-t transition-colors ${
              activeTab === 'output' ? 'text-white bg-white/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Output
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'config' ? (
          <>
            {ConfigComponent && (
              <ConfigComponent
                nodeId={node.id}
                config={node.data.config || {}}
                onChange={handleConfigChange}
              />
            )}
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
          </>
        ) : (
          <NodeOutputTab nodeLog={nodeLog} />
        )}
      </div>
    </div>
  )
}

function NodeOutputTab({ nodeLog }) {
  if (!nodeLog) return <p className="text-sm text-slate-500">No execution data</p>

  const duration = nodeLog.duration_ms != null ? `${(nodeLog.duration_ms / 1000).toFixed(1)}s` : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          nodeLog.status === 'success' ? 'bg-emerald-600/20 text-emerald-400' :
          nodeLog.status === 'error' ? 'bg-red-600/20 text-red-400' :
          'bg-slate-600/20 text-slate-400'
        }`}>
          {nodeLog.status}
        </span>
        <span className="text-xs text-slate-500 font-mono">{duration}</span>
        {nodeLog.tokens_used > 0 && (
          <span className="text-xs text-violet-400 font-mono">{nodeLog.tokens_used} tokens</span>
        )}
      </div>

      {nodeLog.input_preview && (
        <div>
          <p className="text-[10px] text-slate-500 mb-1 font-medium">Input</p>
          <pre className="text-[11px] text-slate-400 font-mono bg-[#1E1E2E] rounded-lg p-3 overflow-auto max-h-[150px] whitespace-pre-wrap">
            {nodeLog.input_preview}
          </pre>
        </div>
      )}

      {nodeLog.output_preview && (
        <div>
          <p className="text-[10px] text-slate-500 mb-1 font-medium">Output</p>
          <pre className="text-[11px] text-slate-300 font-mono bg-[#1E1E2E] rounded-lg p-3 overflow-auto max-h-[200px] whitespace-pre-wrap">
            {nodeLog.output_preview}
          </pre>
        </div>
      )}

      {nodeLog.error_message && (
        <div>
          <p className="text-[10px] text-red-400 mb-1 font-medium">Error</p>
          <pre className="text-[11px] text-red-300 font-mono bg-red-500/10 rounded-lg p-3 overflow-auto max-h-[150px] whitespace-pre-wrap">
            {nodeLog.error_message}
          </pre>
        </div>
      )}
    </div>
  )
}
