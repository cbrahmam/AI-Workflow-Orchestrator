import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Loader2 } from 'lucide-react'

const EXAMPLES = [
  "Scrape Hacker News front page, summarize the top 5 posts, and format as a newsletter",
  "Take a company URL, scrape their about page, extract key info, and generate a cold outreach email",
  "Read a document, summarize it with AI, then translate the summary to Spanish",
  "Monitor an API endpoint, check if the response contains errors, and send a Slack alert if it does",
]

export default function GenerateModal({ onClose }) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, save: true }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Error ${res.status}`)
      }

      const result = await res.json()
      if (result.id) {
        navigate(`/?workflow=${result.id}`)
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-[560px] max-h-[80vh] rounded-xl overflow-hidden animate-fade-in"
        style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2A2A3C' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/15">
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Workflow Generator</h2>
              <p className="text-[11px] text-slate-500">Describe what you want, we'll build it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Describe your workflow
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Scrape a website, summarize the content with AI, and send the summary to Slack"
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-colors text-slate-200 placeholder-slate-600 resize-none"
              style={{ background: '#0D0D15', border: '1px solid #2A2A3C' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
              }}
              autoFocus
            />
          </div>

          {/* Examples */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Examples — click to use</p>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left text-[11px] text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors leading-relaxed"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: '#2A2A3C' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Generate Workflow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
