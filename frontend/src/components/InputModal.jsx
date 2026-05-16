import { useState } from 'react'
import { X, Play } from 'lucide-react'

export default function InputModal({ inputConfig, onRun, onCancel }) {
  const inputType = inputConfig?.inputType || 'text'
  const [value, setValue] = useState(inputConfig?.defaultValue || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-[500px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: '#252535', border: '1px solid #2A2A3C' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2A2A3C' }}>
          <h2 className="text-sm font-semibold text-white">Provide Workflow Input</h2>
          <button onClick={onCancel} className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            {inputType === 'json' ? 'JSON Input' : 'Text Input'}
          </label>
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={inputType === 'json' ? 10 : 6}
            placeholder={inputType === 'json' ? '{"key": "value"}' : 'Enter your input...'}
            className="w-full bg-[#1E1E2E] text-sm text-slate-200 rounded-lg px-4 py-3 border border-[#2A2A3C] outline-none focus:border-violet-500 font-mono resize-none placeholder:text-slate-600"
            autoFocus
          />
          {inputType === 'json' && (
            <p className="text-[10px] text-slate-500 mt-1">Must be valid JSON</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: '#2A2A3C' }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              let parsed = value
              if (inputType === 'json') {
                try { parsed = JSON.parse(value) } catch { /* send raw */ }
              }
              onRun(parsed)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            <Play size={13} />
            Run Workflow
          </button>
        </div>
      </div>
    </div>
  )
}
