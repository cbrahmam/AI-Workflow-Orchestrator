import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Play, Square, Undo2, Redo2, LayoutGrid, Clock, Download, Upload } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { createWorkflow, updateWorkflow, executeWorkflow, cancelExecution } from '../api/client'
import { validateWorkflow } from '../utils/validators'
import InputModal from './InputModal'
import Toast from './Toast'
import RunHistory from './RunHistory'

const AUTO_SAVE_INTERVAL = 30000

export default function Toolbar() {
  const navigate = useNavigate()

  const workflowName = useWorkflowStore(s => s.workflowName)
  const setWorkflowName = useWorkflowStore(s => s.setWorkflowName)
  const workflowId = useWorkflowStore(s => s.workflowId)
  const isDirty = useWorkflowStore(s => s.isDirty)
  const undo = useWorkflowStore(s => s.undo)
  const redo = useWorkflowStore(s => s.redo)
  const past = useWorkflowStore(s => s.past)
  const future = useWorkflowStore(s => s.future)
  const serializeWorkflow = useWorkflowStore(s => s.serializeWorkflow)
  const nodes = useWorkflowStore(s => s.nodes)
  const edges = useWorkflowStore(s => s.edges)
  const isExecuting = useWorkflowStore(s => s.isExecuting)
  const executionId = useWorkflowStore(s => s.executionId)

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [showInputModal, setShowInputModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [toast, setToast] = useState(null)
  const pollRef = useRef(null)
  const autoSaveRef = useRef(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [])

  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)

    autoSaveRef.current = setInterval(() => {
      const state = useWorkflowStore.getState()
      if (state.isDirty && state.nodes.length > 0) {
        performSave(true)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [])

  const performSave = async (isAutoSave = false) => {
    if (saving) return
    setSaving(true)
    if (!isAutoSave) setSaveStatus('')
    else setSaveStatus('Auto-saving...')

    try {
      const data = useWorkflowStore.getState().serializeWorkflow()
      const wfId = useWorkflowStore.getState().workflowId

      if (wfId) {
        await updateWorkflow(wfId, { name: data.name, workflow_json: data.workflow_json })
      } else {
        const result = await createWorkflow({ name: data.name, workflow_json: data.workflow_json })
        useWorkflowStore.setState({ workflowId: result.id })
        window.history.replaceState(null, '', `/?workflow=${result.id}`)
      }
      useWorkflowStore.setState({ isDirty: false })
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (err) {
      setSaveStatus('Error')
      console.error('Save failed:', err)
      setTimeout(() => setSaveStatus(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => performSave(false)

  const handleRun = useCallback(() => {
    const state = useWorkflowStore.getState()
    const validation = validateWorkflow(state.nodes, state.edges)
    if (!validation.valid) {
      const msgs = validation.errors.map(e => e.message).join(', ')
      setToast({ message: `Validation failed: ${msgs}`, type: 'error' })
      return
    }

    const inputNode = state.nodes.find(n => n.data.nodeType === 'input')
    if (inputNode) {
      setShowInputModal(true)
    } else {
      startExecution(null)
    }
  }, [])

  const startExecution = useCallback(async (input) => {
    setShowInputModal(false)

    let wfId = useWorkflowStore.getState().workflowId
    const dirty = useWorkflowStore.getState().isDirty
    if (!wfId || dirty) {
      const data = useWorkflowStore.getState().serializeWorkflow()
      if (wfId) {
        await updateWorkflow(wfId, { name: data.name, workflow_json: data.workflow_json })
      } else {
        const result = await createWorkflow({ name: data.name, workflow_json: data.workflow_json })
        wfId = result.id
        useWorkflowStore.setState({ workflowId: wfId })
        window.history.replaceState(null, '', `/?workflow=${wfId}`)
      }
      useWorkflowStore.setState({ isDirty: false })
    }

    useWorkflowStore.getState().resetNodeStatuses()
    useWorkflowStore.setState({
      isExecuting: true,
      executionStatus: 'running',
      executionResult: null,
      showExecutionPanel: true,
    })

    try {
      const result = await executeWorkflow(wfId, input)

      useWorkflowStore.setState({
        executionId: result.execution_id,
        executionStatus: result.status,
        executionResult: result,
        isExecuting: false,
      })
      useWorkflowStore.getState().updateNodeStatuses(result.node_logs)

      if (result.status === 'completed') {
        const dur = result.total_duration_ms != null ? `${(result.total_duration_ms / 1000).toFixed(1)}s` : ''
        setToast({ message: `Workflow completed in ${dur}`, type: 'success' })
      } else if (result.status === 'failed') {
        setToast({ message: `Workflow failed: ${result.error_summary || 'Unknown error'}`, type: 'error' })
      }
    } catch (err) {
      useWorkflowStore.setState({
        isExecuting: false,
        executionStatus: 'failed',
      })
      setToast({ message: `Execution error: ${err.message}`, type: 'error' })
    }
  }, [])

  const handleCancel = useCallback(async () => {
    const execId = useWorkflowStore.getState().executionId
    if (execId) {
      try {
        await cancelExecution(execId)
        setToast({ message: 'Cancellation requested', type: 'warning' })
      } catch (err) {
        console.error('Cancel failed:', err)
      }
    }
  }, [])

  const handleExport = () => {
    const data = useWorkflowStore.getState().serializeWorkflow()
    const blob = new Blob([JSON.stringify(data.workflow_json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.name || 'workflow').replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToast({ message: 'Workflow exported', type: 'success' })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const text = await file.text()
      try {
        const json = JSON.parse(text)
        useWorkflowStore.getState().loadWorkflow({
          name: file.name.replace('.json', '').replace(/-/g, ' '),
          workflow_json: json,
        })
        setToast({ message: 'Workflow imported', type: 'success' })
      } catch (err) {
        setToast({ message: 'Invalid JSON file', type: 'error' })
      }
    }
    input.click()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!useWorkflowStore.getState().isExecuting) handleRun()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRun])

  return (
    <>
      <div
        className="flex items-center justify-between px-4 h-[50px] flex-shrink-0"
        style={{ background: '#161622', borderBottom: '1px solid #2A2A3C' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/workflows')}
            className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="All Workflows"
          >
            <LayoutGrid size={15} />
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none border-none px-2 py-1 rounded hover:bg-white/5 focus:bg-white/5 transition-colors w-[200px]"
          />
          {isDirty && <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />}
          {saveStatus && (
            <span className={`text-xs ${saveStatus === 'Saved' ? 'text-emerald-400' : saveStatus === 'Error' ? 'text-red-400' : 'text-slate-400'}`}>
              {saveStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleImport}
            className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Import workflow"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Export workflow"
          >
            <Download size={14} />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            title="Execution History"
          >
            <Clock size={14} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
            title="Save (Cmd+S)"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {isExecuting ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cancel execution"
            >
              <Square size={13} />
              Cancel
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={nodes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Run workflow (Cmd+Enter)"
            >
              <Play size={13} />
              Run
            </button>
          )}

          <div className="w-px h-5 bg-slate-700 mx-1" />

          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={15} />
          </button>
        </div>
      </div>

      {showInputModal && (
        <InputModal
          inputConfig={nodes.find(n => n.data.nodeType === 'input')?.data?.config}
          onRun={startExecution}
          onCancel={() => setShowInputModal(false)}
        />
      )}

      {showHistory && (
        <RunHistory onClose={() => setShowHistory(false)} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
