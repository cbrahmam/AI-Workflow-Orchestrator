import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Zap, ChevronDown, ChevronRight, X } from 'lucide-react'
import { listExecutions } from '../api/client'
import { NODE_TYPES } from '../utils/nodeTypes'
import useWorkflowStore from '../store/workflowStore'

const STATUS_STYLES = {
  completed: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', icon: CheckCircle },
  failed: { bg: 'bg-red-600/20', text: 'text-red-400', icon: XCircle },
  running: { bg: 'bg-blue-600/20', text: 'text-blue-400', icon: Clock },
}

export default function RunHistory({ onClose }) {
  const workflowId = useWorkflowStore(s => s.workflowId)
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (workflowId) loadHistory()
  }, [workflowId])

  async function loadHistory() {
    try {
      const data = await listExecutions(workflowId)
      setExecutions(data)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  if (!workflowId) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">Save the workflow first to view execution history.</p>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col overflow-hidden"
        style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2A2A3C' }}>
          <h2 className="text-sm font-semibold text-white">Execution History</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-lg p-4 animate-pulse" style={{ background: '#252535' }}>
                  <div className="h-3 bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : executions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No executions yet</p>
          ) : (
            <div className="space-y-2">
              {executions.map(exec => {
                const statusDef = STATUS_STYLES[exec.status] || STATUS_STYLES.failed
                const StatusIcon = statusDef.icon
                const isOpen = expanded === exec.execution_id
                const duration = exec.total_duration_ms != null
                  ? `${(exec.total_duration_ms / 1000).toFixed(1)}s`
                  : '—'

                return (
                  <div key={exec.execution_id} className="rounded-lg overflow-hidden" style={{ background: '#252535' }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : exec.execution_id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      {isOpen
                        ? <ChevronDown size={13} className="text-slate-500" />
                        : <ChevronRight size={13} className="text-slate-500" />
                      }
                      <StatusIcon size={14} className={statusDef.text} />
                      <span className="text-xs font-medium text-slate-200 flex-1">
                        {formatDate(exec.started_at)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusDef.bg} ${statusDef.text}`}>
                        {exec.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{duration}</span>
                      {exec.total_tokens_used > 0 && (
                        <span className="text-[11px] text-violet-400 font-mono flex items-center gap-1">
                          <Zap size={10} />
                          {exec.total_tokens_used}
                        </span>
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: '#2A2A3C' }}>
                        <div className="mt-3 space-y-2">
                          {exec.node_logs?.map(log => {
                            const typeDef = NODE_TYPES[log.node_type]
                            const Icon = typeDef?.icon
                            const logDuration = log.duration_ms != null ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'
                            return (
                              <div key={log.node_id} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: '#1E1E2E' }}>
                                {Icon && <Icon size={12} style={{ color: typeDef.color }} />}
                                <span className="text-[11px] text-slate-300 flex-1">{log.node_title}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                  log.status === 'success' ? 'bg-emerald-600/20 text-emerald-400' :
                                  log.status === 'error' ? 'bg-red-600/20 text-red-400' :
                                  'bg-slate-600/20 text-slate-400'
                                }`}>
                                  {log.status}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{logDuration}</span>
                              </div>
                            )
                          })}
                        </div>

                        {exec.final_output && (
                          <div className="mt-3">
                            <p className="text-[10px] text-slate-500 mb-1 font-medium">Output</p>
                            <pre className="text-[11px] text-slate-300 font-mono rounded p-2 overflow-auto max-h-[100px] whitespace-pre-wrap" style={{ background: '#1A1A2A' }}>
                              {typeof exec.final_output === 'string' ? exec.final_output : JSON.stringify(exec.final_output, null, 2)}
                            </pre>
                          </div>
                        )}

                        {exec.error_summary && (
                          <div className="mt-3">
                            <p className="text-[10px] text-red-400 mb-1 font-medium">Error</p>
                            <pre className="text-[11px] text-red-300 font-mono bg-red-500/10 rounded p-2 overflow-auto max-h-[100px] whitespace-pre-wrap">
                              {exec.error_summary}
                            </pre>
                          </div>
                        )}

                        <p className="text-[9px] text-slate-600 font-mono mt-2">
                          ID: {exec.execution_id}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
