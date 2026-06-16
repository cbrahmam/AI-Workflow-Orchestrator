import { Section, TextInput, TextArea } from './FormFields'
import VariableChips from './VariableChips'

const MODEL_OPTIONS = [
  { provider: 'claude', model: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { provider: 'claude', model: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { provider: 'openai', model: 'gpt-4o', label: 'GPT-4o' },
  { provider: 'openai', model: 'gpt-4o-mini', label: 'GPT-4o Mini' },
]

export default function ABCompareConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })
  const models = config.models || []

  const toggleModel = (opt) => {
    const exists = models.find(m => m.model === opt.model)
    if (exists) {
      update('models', models.filter(m => m.model !== opt.model))
    } else {
      update('models', [...models, { provider: opt.provider, model: opt.model }])
    }
  }

  return (
    <div className="space-y-4">
      <Section title="Prompt">
        <TextArea
          label="User Prompt"
          value={config.prompt || ''}
          onChange={v => update('prompt', v)}
          placeholder="Enter the prompt to send to all models..."
          rows={3}
        />
        <VariableChips nodeId={nodeId} onInsert={(v) => update('prompt', (config.prompt || '') + v)} />
        <TextArea
          label="System Prompt"
          value={config.systemPrompt || ''}
          onChange={v => update('systemPrompt', v)}
          placeholder="Optional system instructions..."
          rows={2}
        />
      </Section>

      <Section title="Models to Compare">
        <div className="space-y-1.5">
          {MODEL_OPTIONS.map(opt => {
            const active = models.some(m => m.model === opt.model)
            return (
              <label key={opt.model} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleModel(opt)}
                  className="rounded border-slate-600"
                />
                <span className={active ? 'text-white' : 'text-slate-400'}>{opt.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{opt.provider}</span>
              </label>
            )
          })}
        </div>
        {models.length < 2 && (
          <p className="text-[10px] text-amber-400 mt-1">Select at least 2 models to compare</p>
        )}
      </Section>

      <Section title="Parameters">
        <TextInput
          label="Temperature"
          value={config.temperature ?? 0.7}
          onChange={v => update('temperature', parseFloat(v) || 0)}
        />
        <TextInput
          label="Max Tokens"
          value={config.maxTokens ?? 1024}
          onChange={v => update('maxTokens', parseInt(v) || 1024)}
        />
      </Section>
    </div>
  )
}
