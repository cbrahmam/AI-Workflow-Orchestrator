import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Copy, Play, Clock, CheckCircle, XCircle, Download, Upload, Workflow } from 'lucide-react'
import { listWorkflows, deleteWorkflow, duplicateWorkflow, createWorkflow } from '../api/client'
import { NODE_TYPES } from '../utils/nodeTypes'

export default function WorkflowList() {
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadWorkflows()
  }, [])

  async function loadWorkflows() {
    try {
      const data = await listWorkflows()
      setWorkflows(data)
    } catch (err) {
      console.error('Failed to load workflows:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (deleting === id) {
      await deleteWorkflow(id)
      setWorkflows(ws => ws.filter(w => w.id !== id))
      setDeleting(null)
    } else {
      setDeleting(id)
      setTimeout(() => setDeleting(null), 3000)
    }
  }

  async function handleDuplicate(e, id) {
    e.stopPropagation()
    const result = await duplicateWorkflow(id)
    setWorkflows(ws => [result, ...ws])
  }

  async function handleNew() {
    navigate('/')
  }

  async function handleExport(e, workflow) {
    e.stopPropagation()
    const blob = new Blob([JSON.stringify(workflow.workflow_json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const text = await file.text()
      try {
        const json = JSON.parse(text)
        const name = file.name.replace('.json', '').replace(/-/g, ' ')
        const result = await createWorkflow({
          name,
          workflow_json: json,
        })
        navigate(`/?workflow=${result.id}`)
      } catch (err) {
        console.error('Import failed:', err)
      }
    }
    input.click()
  }

  function getNodeBreakdown(workflow) {
    const nodes = workflow.workflow_json?.nodes || []
    if (nodes.length === 0) return 'Empty'
    const counts = {}
    nodes.forEach(n => {
      const type = n.data?.nodeType || n.type
      const label = NODE_TYPES[type]?.label || type
      counts[label] = (counts[label] || 0) + 1
    })
    const parts = Object.entries(counts).map(([label, count]) => `${count} ${label}`)
    return `${nodes.length} nodes: ${parts.join(', ')}`
  }

  function getStatusIcon(workflow) {
    const wf = workflow.workflow_json
    if (!wf?.nodes || wf.nodes.length === 0) {
      return <div className="w-2 h-2 rounded-full bg-slate-600" />
    }
    return <div className="w-2 h-2 rounded-full bg-slate-500" />
  }

  function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0D15' }}>
      {/* Header */}
      <div className="border-b" style={{ background: '#161622', borderColor: '#2A2A3C' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600/20">
              <Workflow size={20} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">FlowPilot</h1>
              <p className="text-xs text-slate-500">Your Workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Templates
            </button>
            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              <Plus size={14} />
              New Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
            style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-700/50 rounded w-full mb-2" />
                <div className="h-3 bg-slate-700/50 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Workflow size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">
              {search ? 'No workflows match your search' : 'No workflows yet'}
            </p>
            <button
              onClick={handleNew}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              Create your first workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(wf => (
              <div
                key={wf.id}
                onClick={() => navigate(`/?workflow=${wf.id}`)}
                className="rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(wf)}
                    <h3 className="text-sm font-medium text-white truncate">{wf.name}</h3>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleExport(e, wf)}
                      className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10"
                      title="Export"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, wf.id)}
                      className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10"
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, wf.id)}
                      className={`p-1.5 rounded transition-colors ${
                        deleting === wf.id
                          ? 'text-red-400 bg-red-500/10'
                          : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title={deleting === wf.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {wf.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{wf.description}</p>
                )}

                <p className="text-[11px] text-slate-500 font-mono mb-2">
                  {getNodeBreakdown(wf)}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(wf.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
