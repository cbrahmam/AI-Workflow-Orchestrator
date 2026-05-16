import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/50 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const Icon = icons[type] || icons.success
  const colorClass = colors[type] || colors.success

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-xl ${colorClass}`}
      style={{ background: type === 'success' ? '#10B98115' : type === 'error' ? '#EF444415' : '#F59E0B15' }}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-0.5 rounded hover:bg-white/10">
        <X size={14} />
      </button>
    </div>
  )
}
