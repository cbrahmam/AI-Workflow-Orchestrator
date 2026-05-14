import { useState } from 'react'
import { Save, Play, Undo2, Redo2 } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { createWorkflow, updateWorkflow } from '../api/client'

export default function Toolbar() {
  const workflowName = useWorkflowStore(s => s.workflowName)
  const setWorkflowName = useWorkflowStore(s => s.setWorkflowName)
  const workflowId = useWorkflowStore(s => s.workflowId)
  const isDirty = useWorkflowStore(s => s.isDirty)
  const undo = useWorkflowStore(s => s.undo)
  const redo = useWorkflowStore(s => s.redo)
  const past = useWorkflowStore(s => s.past)
  const future = useWorkflowStore(s => s.future)
  const serializeWorkflow = useWorkflowStore(s => s.serializeWorkflow)

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('')
    try {
      const data = serializeWorkflow()
      if (workflowId) {
        await updateWorkflow(workflowId, {
          name: data.name,
          workflow_json: data.workflow_json,
        })
      } else {
        const result = await createWorkflow({
          name: data.name,
          workflow_json: data.workflow_json,
        })
        useWorkflowStore.setState({ workflowId: result.id })
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

  return (
    <div
      className="flex items-center justify-between px-4 h-[50px] flex-shrink-0"
      style={{
        background: '#161622',
        borderBottom: '1px solid #2A2A3C',
      }}
    >
      {/* Left: Workflow Name */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="bg-transparent text-sm font-medium text-white outline-none border-none px-2 py-1 rounded hover:bg-white/5 focus:bg-white/5 transition-colors w-[200px]"
        />
        {isDirty && (
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
        )}
        {saveStatus && (
          <span className={`text-xs ${saveStatus === 'Saved' ? 'text-emerald-400' : 'text-red-400'}`}>
            {saveStatus}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
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

        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 cursor-not-allowed"
          title="Run workflow (available in Block 3)"
        >
          <Play size={14} />
          Run
        </button>

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
  )
}
