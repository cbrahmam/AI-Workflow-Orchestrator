import { Monitor } from 'lucide-react'

export default function MobileWarning() {
  return (
    <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center px-6" style={{ background: '#0D0D15' }}>
      <div className="text-center">
        <Monitor size={48} className="text-slate-500 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">Desktop Required</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          FlowPilot's workflow editor requires a desktop browser for the best experience.
          Please open this page on a larger screen.
        </p>
      </div>
    </div>
  )
}
