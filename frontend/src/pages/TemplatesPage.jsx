import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Workflow, Brain, Globe, GitBranch, FileText, ArrowRightLeft, Users, Tag, ExternalLink } from 'lucide-react'
import { listTemplates, listCommunityTemplates, useTemplate } from '../api/client'

const CATEGORY_COLORS = {
  Content: '#10B981',
  Sales: '#F59E0B',
  Productivity: '#0EA5E9',
  Data: '#8B5CF6',
  AI: '#EAB308',
  content: '#10B981',
  research: '#0EA5E9',
  data: '#8B5CF6',
  automation: '#F59E0B',
  analysis: '#EAB308',
  general: '#6B7280',
}

const CATEGORY_ICONS = {
  Content: FileText,
  Sales: Globe,
  Productivity: ArrowRightLeft,
  Data: GitBranch,
  AI: Brain,
  content: FileText,
  research: Globe,
  data: GitBranch,
  automation: ArrowRightLeft,
  analysis: Brain,
  general: Workflow,
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('built-in')
  const [templates, setTemplates] = useState([])
  const [communityTemplates, setCommunityTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [using, setUsing] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const [builtIn, community] = await Promise.all([
        listTemplates(),
        listCommunityTemplates(),
      ])
      setTemplates(builtIn)
      setCommunityTemplates(community)
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUse(template) {
    setUsing(template.id)
    try {
      const result = await useTemplate(template.id)
      navigate(`/?workflow=${result.id}`)
    } catch (err) {
      console.error('Failed to use template:', err)
      setUsing(null)
    }
  }

  const currentTemplates = activeTab === 'built-in' ? templates : communityTemplates

  return (
    <div className="min-h-screen" style={{ background: '#0D0D15' }}>
      {/* Header */}
      <div className="border-b" style={{ background: '#161622', borderColor: '#2A2A3C' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workflows')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Templates</h1>
              <p className="text-xs text-slate-500">Start with a pre-built workflow</p>
            </div>
          </div>
          <a
            href="https://github.com/cbrahmam/AI-Workflow-Orchestrator/blob/main/CONTRIBUTING.md#contributing-templates"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink size={12} />
            Submit a Template
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: '#2A2A3C' }}>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('built-in')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'built-in'
                ? 'text-white border-violet-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Built-in
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{templates.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'text-white border-emerald-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Users size={14} />
            Community
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{communityTemplates.length}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl p-6 animate-pulse" style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}>
                <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-700/50 rounded w-full mb-2" />
                <div className="h-3 bg-slate-700/50 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : currentTemplates.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-sm font-medium text-slate-400 mb-2">No community templates yet</h3>
            <p className="text-xs text-slate-500 mb-4">Be the first to contribute!</p>
            <a
              href="https://github.com/cbrahmam/AI-Workflow-Orchestrator/blob/main/CONTRIBUTING.md#contributing-templates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
            >
              <ExternalLink size={12} />
              Learn how to submit
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentTemplates.map(template => {
              const color = CATEGORY_COLORS[template.category] || '#6B7280'
              const CatIcon = CATEGORY_ICONS[template.category] || Workflow
              return (
                <div
                  key={template.id}
                  className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] group"
                  style={{ background: '#1E1E2E', border: '1px solid #2A2A3C' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ background: `${color}18` }}
                      >
                        <CatIcon size={20} style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${color}18`, color }}
                        >
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {template.description}
                  </p>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                      <Tag size={10} className="text-slate-500" />
                      {template.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {template.node_count} nodes
                      </span>
                      {template.author && (
                        <span className="text-[11px] text-slate-500">
                          by <span className="text-slate-400">{template.author}</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleUse(template)}
                      disabled={using === template.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      style={{ background: `${color}20`, color }}
                    >
                      <Play size={12} />
                      {using === template.id ? 'Creating...' : 'Use Template'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
