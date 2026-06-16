import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Workflow, LayoutGrid, Sparkles, Wand2, BarChart3 } from 'lucide-react'
import NodePalette from './NodePalette'
import GenerateModal from './GenerateModal'

export default function Sidebar() {
  const navigate = useNavigate()
  const [showGenerate, setShowGenerate] = useState(false)

  return (
    <div
      className="w-[280px] flex-shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        background: '#252535',
        borderRight: '1px solid #2A2A3C',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: '#2A2A3C' }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20">
          <Workflow size={18} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white leading-tight">FlowPilot</h1>
          <p className="text-[10px] text-slate-500">Visual AI Workflows</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 pt-3 pb-1 flex gap-1.5">
        <button
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LayoutGrid size={13} />
          Workflows
        </button>
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Sparkles size={13} />
          Templates
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <BarChart3 size={13} />
          Analytics
        </button>
      </div>

      {/* AI Generate Button */}
      <div className="px-3 pt-2 pb-1">
        <button
          onClick={() => setShowGenerate(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
        >
          <Wand2 size={14} />
          AI Generate
        </button>
      </div>

      {/* Node Palette */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3">
            Drag to canvas
          </p>
        </div>
        <NodePalette />
      </div>

      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
    </div>
  )
}
