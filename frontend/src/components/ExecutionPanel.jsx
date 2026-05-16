import { useState } from 'react'
import { X, Copy, Check, ChevronDown, ChevronRight, Clock, Zap, Hash, Activity } from 'lucide-react'
import { NODE_TYPES } from '../utils/nodeTypes'
import useWorkflowStore from '../store/workflowStore'

const STATUS_BADGES = {
  pending: 'bg-slate-600/20 text-slate-400',
  running: 'bg-blue-600/20 text-blue-400',
  success: 'bg-emerald-600/20 text-emerald-400',
  error: 'bg-red-600/20 text-red-400',
  skipped: 'bg-slate-600/20 text-slate-500',
}

export default function ExecutionPanel() {
  const result = useWorkflowStore(s => s.executionResult)
  const showPanel = useWorkflowStore(s => s.showExecutionPanel)
  const setExecutionState = useWorkflowStore(s => s.setExecutionState)

  const [activeTab, setActiveTab] = useState('output')
  const [copied, setCopied] = useState(false)

  if (!showPanel || !result) return null

  const handleCopy = async () => {
    const text = typeof result.final_output === 'string'
      ? result.final_output
      : JSON.stringify(result.final_output, null, 2)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { id: 'output', label: 'Output' },
    { id: 'logs', label: 'Logs' },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <div
      className="flex flex-col border-t animate-slide-up"
      style={{ background: '#1A1A2A', borderColor: '#2A2A3C', height: '40vh', minHeight: 200 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#2A2A3C' }}>
        <div className="flex items-center gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                activeTab === tab.id
                  ? 'text-white bg-white/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGES[result.status] || ''}`}>
            {result.status}
          </span>
        </div>
        <button
          onClick={() => setExecutionState({ showExecutionPanel: false })}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'output' && <OutputTab result={result} onCopy={handleCopy} copied={copied} />}
        {activeTab === 'logs' && <LogsTab result={result} />}
        {activeTab === 'stats' && <StatsTab result={result} />}
      </div>
    </div>
  )
}

function OutputTab({ result, onCopy, copied }) {
  if (!result.final_output && result.status !== 'completed') {
    return <p className="text-sm text-slate-500">Waiting for execution to complete...</p>
  }
  if (!result.final_output) {
    return <p className="text-sm text-slate-500">No output produced</p>
  }

  const isJson = typeof result.final_output === 'object'
  const displayText = isJson ? JSON.stringify(result.final_output, null, 2) : String(result.final_output)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium">Final Output</p>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-sm text-slate-200 font-mono bg-[#0D0D15] rounded-lg p-4 overflow-auto max-h-[300px] whitespace-pre-wrap">
        {displayText}
      </pre>
    </div>
  )
}

function LogsTab({ result }) {
  const [expanded, setExpanded] = useState({})

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-1">
      {result.node_logs?.map(log => {
        const typeDef = NODE_TYPES[log.node_type]
        const Icon = typeDef?.icon
        const isOpen = expanded[log.node_id]
        const duration = log.duration_ms != null ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'

        return (
          <div key={log.node_id} className="rounded-lg" style={{ background: '#252535' }}>
            <button
              onClick={() => toggle(log.node_id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
            >
              {isOpen ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
              {Icon && <Icon size={13} style={{ color: typeDef.color }} />}
              <span className="text-xs font-medium text-slate-200 flex-1">{log.node_title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_BADGES[log.status] || ''}`}>
                {log.status}
              </span>
              <span className="text-[10px] text-slate-500 font-mono w-12 text-right">{duration}</span>
              {log.tokens_used > 0 && (
                <span className="text-[10px] text-violet-400 font-mono">{log.tokens_used} tok</span>
              )}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: '#2A2A3C' }}>
                {log.input_preview && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-500 mb-1">Input</p>
                    <pre className="text-[11px] text-slate-400 font-mono bg-[#1A1A2A] rounded p-2 overflow-auto max-h-[100px] whitespace-pre-wrap">
                      {log.input_preview}
                    </pre>
                  </div>
                )}
                {log.output_preview && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Output</p>
                    <pre className="text-[11px] text-slate-300 font-mono bg-[#1A1A2A] rounded p-2 overflow-auto max-h-[100px] whitespace-pre-wrap">
                      {log.output_preview}
                    </pre>
                  </div>
                )}
                {log.error_message && (
                  <div>
                    <p className="text-[10px] text-red-400 mb-1">Error</p>
                    <pre className="text-[11px] text-red-300 font-mono bg-red-500/10 rounded p-2 overflow-auto max-h-[100px] whitespace-pre-wrap">
                      {log.error_message}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatsTab({ result }) {
  const totalNodes = result.node_logs?.length || 0
  const executedNodes = result.node_logs?.filter(l => l.status === 'success').length || 0
  const skippedNodes = result.node_logs?.filter(l => l.status === 'skipped').length || 0
  const failedNodes = result.node_logs?.filter(l => l.status === 'error').length || 0

  const estimatedCost = result.total_tokens_used > 0
    ? `~$${(result.total_tokens_used * 0.000003).toFixed(4)}`
    : '—'

  const stats = [
    { icon: Clock, label: 'Total Duration', value: result.total_duration_ms != null ? `${(result.total_duration_ms / 1000).toFixed(2)}s` : '—' },
    { icon: Zap, label: 'Tokens Used', value: result.total_tokens_used || 0 },
    { icon: Zap, label: 'Estimated Cost', value: estimatedCost },
    { icon: Activity, label: 'API Calls', value: result.total_api_calls || 0 },
    { icon: Hash, label: 'Nodes Executed', value: `${executedNodes} / ${totalNodes}` },
    { icon: Hash, label: 'Skipped', value: skippedNodes },
    { icon: Hash, label: 'Failed', value: failedNodes },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const SIcon = stat.icon
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#252535' }}>
              <SIcon size={14} className="text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
                <p className="text-sm font-mono text-slate-200">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="p-3 rounded-lg" style={{ background: '#252535' }}>
        <p className="text-[10px] text-slate-500 mb-1">Execution ID</p>
        <p className="text-xs font-mono text-slate-400">{result.execution_id}</p>
        <p className="text-[10px] text-slate-500 mt-2 mb-1">Started At</p>
        <p className="text-xs font-mono text-slate-400">{result.started_at}</p>
      </div>
    </div>
  )
}
