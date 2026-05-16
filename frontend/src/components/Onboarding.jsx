import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'

const STEPS = [
  { title: 'Drag nodes', description: 'Drag nodes from the sidebar onto the canvas to build your workflow.' },
  { title: 'Connect nodes', description: 'Drag from one handle to another to connect nodes and define data flow.' },
  { title: 'Configure', description: 'Click any node to open the config panel and set its parameters.' },
  { title: 'Run', description: 'Hit the Run button (or Cmd+Enter) to execute your workflow.' },
]

const STORAGE_KEY = 'flowpilot-onboarding-complete'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      dismiss()
    }
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl shadow-2xl max-w-md"
        style={{ background: '#252535', border: '1px solid #3A3A4C' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-violet-400">{step + 1}/{STEPS.length}</span>
            <span className="text-xs font-semibold text-white">{current.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{current.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={next}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors"
          >
            {step < STEPS.length - 1 ? <>Next <ArrowRight size={12} /></> : 'Got it'}
          </button>
          <button
            onClick={dismiss}
            className="p-1 rounded text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
