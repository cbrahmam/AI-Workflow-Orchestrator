import { useState, useEffect } from 'react'
import { Section } from './FormFields'
import { listWorkflows } from '../../api/client'

export default function SubWorkflowConfig({ nodeId, config, onChange }) {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listWorkflows()
      .then(setWorkflows)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (e) => {
    const wf = workflows.find(w => w.id === e.target.value)
    onChange({
      ...config,
      workflowId: e.target.value,
      workflowName: wf?.name || '',
    })
  }

  return (
    <div className="space-y-4">
      <Section title="Sub-Workflow">
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Select Workflow
        </label>
        {loading ? (
          <p className="text-xs text-slate-500">Loading workflows...</p>
        ) : (
          <select
            value={config.workflowId || ''}
            onChange={handleSelect}
            className="w-full text-xs rounded-lg px-3 py-2 outline-none transition-colors text-slate-200"
            style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
          >
            <option value="">Choose a workflow...</option>
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>{wf.name}</option>
            ))}
          </select>
        )}
        {config.workflowName && (
          <p className="text-[10px] text-slate-500 mt-1">
            Selected: <span className="text-slate-400">{config.workflowName}</span>
          </p>
        )}
      </Section>

      <div className="p-3 rounded-lg" style={{ background: '#1E1E2E' }}>
        <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">How it works</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Runs the selected workflow as a single step. The input from the previous node
          is passed as the sub-workflow's input, and the sub-workflow's final output
          becomes this node's output.
        </p>
      </div>
    </div>
  )
}
