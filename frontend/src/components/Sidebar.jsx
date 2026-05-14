import { Workflow } from 'lucide-react'
import NodePalette from './NodePalette'

export default function Sidebar() {
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

      {/* Node Palette */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3">
            Drag to canvas
          </p>
        </div>
        <NodePalette />
      </div>
    </div>
  )
}
