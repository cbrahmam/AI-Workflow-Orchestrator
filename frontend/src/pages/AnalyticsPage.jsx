import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Zap, Clock, DollarSign, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0D0D15' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <Activity size={32} className="mx-auto text-slate-600 animate-pulse mb-4" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary, status_breakdown, daily_stats, top_workflows, recent_executions } = data

  const maxDailyExec = Math.max(...daily_stats.map(d => d.executions), 1)

  return (
    <div className="min-h-screen" style={{ background: '#0D0D15' }}>
      {/* Header */}
      <div className="border-b" style={{ background: '#161622', borderColor: '#2A2A3C' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Analytics</h1>
            <p className="text-xs text-slate-500">Workflow execution insights</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Activity} label="Total Runs" value={summary.total_executions} color="#8B5CF6" />
          <StatCard icon={CheckCircle} label="Success Rate" value={`${summary.success_rate}%`} color="#10B981" />
          <StatCard icon={Zap} label="Total Tokens" value={formatNumber(summary.total_tokens)} color="#F59E0B" />
          <StatCard icon={DollarSign} label="Est. Cost" value={`$${summary.estimated_cost}`} color="#0EA5E9" />
          <StatCard icon={Clock} label="Avg Duration" value={`${(summary.avg_duration_ms / 1000).toFixed(1)}s`} color="#EAB308" />
          <StatCard icon={BarChart3} label="Workflows" value={summary.total_workflows} color="#EC4899" />
        </div>

        {/* Daily Activity Chart */}
        {daily_stats.length > 0 && (
          <div className="rounded-xl p-6" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-violet-400" />
              Daily Activity
            </h2>
            <div className="flex items-end gap-1.5 h-[120px]">
              {daily_stats.slice(0, 14).reverse().map((day, i) => {
                const height = Math.max((day.executions / maxDailyExec) * 100, 4)
                const successRate = day.executions > 0 ? (day.successes / day.executions) : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.executions} runs`}>
                    <div className="w-full relative rounded-t" style={{ height: `${height}%` }}>
                      <div
                        className="absolute inset-0 rounded-t transition-all"
                        style={{
                          background: successRate > 0.8 ? '#10B981' : successRate > 0.5 ? '#F59E0B' : '#EF4444',
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="text-[8px] text-slate-600">{day.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Workflows */}
          <div className="rounded-xl p-6" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Top Workflows</h2>
            <div className="space-y-3">
              {top_workflows.length === 0 ? (
                <p className="text-xs text-slate-500">No workflow data yet</p>
              ) : (
                top_workflows.map((wf, i) => (
                  <div key={wf.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-600 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{wf.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {wf.run_count} runs · {formatNumber(wf.total_tokens)} tokens · ~${wf.estimated_cost}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(wf.avg_duration_ms / 1000).toFixed(1)}s avg
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Executions */}
          <div className="rounded-xl p-6" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Recent Executions</h2>
            <div className="space-y-2">
              {recent_executions.length === 0 ? (
                <p className="text-xs text-slate-500">No executions yet</p>
              ) : (
                recent_executions.slice(0, 10).map(exec => (
                  <div key={exec.id} className="flex items-center gap-3 py-1.5">
                    <StatusDot status={exec.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 truncate">{exec.workflow_name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500">
                        {exec.started_at?.slice(0, 19).replace('T', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-400">
                        {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(1)}s` : '—'}
                      </p>
                      {exec.tokens > 0 && (
                        <p className="text-[10px] text-violet-400 font-mono">{exec.tokens} tok</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        {Object.keys(status_breakdown).length > 0 && (
          <div className="rounded-xl p-6" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Status Breakdown</h2>
            <div className="flex gap-6">
              {Object.entries(status_breakdown).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <StatusDot status={status} />
                  <span className="text-xs text-slate-300 capitalize">{status}</span>
                  <span className="text-xs font-mono text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white font-mono">{value}</p>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = {
    completed: '#10B981',
    running: '#3B82F6',
    failed: '#EF4444',
    error: '#EF4444',
    cancelled: '#F59E0B',
    pending: '#6B7280',
  }
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[status] || '#6B7280' }}
    />
  )
}

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
