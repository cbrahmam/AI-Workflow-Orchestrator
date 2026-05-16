import { X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['Cmd', 'S'], description: 'Save workflow' },
  { keys: ['Cmd', 'Enter'], description: 'Run workflow' },
  { keys: ['Cmd', 'Z'], description: 'Undo' },
  { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Cmd', 'D'], description: 'Duplicate selected node' },
  { keys: ['Delete'], description: 'Delete selected node' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
]

export default function ShortcutsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2A2A3C' }}>
          <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-slate-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 text-[11px] font-mono font-medium rounded"
                    style={{ background: '#252535', color: '#94A3B8', border: '1px solid #3A3A4C' }}
                  >
                    {key === 'Cmd' ? '⌘' : key === 'Shift' ? '⇧' : key === 'Enter' ? '↵' : key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
