import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-screen" style={{ background: '#0D0D15' }}>
          <div className="text-center max-w-md px-6">
            <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6">
              An unexpected error occurred. Your workflow data is safe.
            </p>
            <pre className="text-[11px] text-red-300 font-mono bg-red-500/10 rounded-lg p-3 mb-6 text-left overflow-auto max-h-[120px]">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors mx-auto"
            >
              <RefreshCw size={14} />
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
