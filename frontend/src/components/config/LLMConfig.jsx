import { useRef } from 'react'
import { Select, TextArea, Slider, TextInput, Section } from './FormFields'
import VariableChips from './VariableChips'

const MODELS = {
  claude: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
}

export default function LLMConfig({ nodeId, config, onChange }) {
  const promptRef = useRef(null)
  const update = (key, val) => onChange({ ...config, [key]: val })

  const models = MODELS[config.provider] || MODELS.claude

  const insertVariable = (variable) => {
    const el = promptRef.current
    if (!el) {
      update('userPrompt', (config.userPrompt || '') + variable)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = config.userPrompt || ''
    const newText = text.slice(0, start) + variable + text.slice(end)
    update('userPrompt', newText)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + variable.length
      el.focus()
    })
  }

  return (
    <div className="space-y-4">
      <Section title="Model">
        <Select
          label="Provider"
          value={config.provider || 'claude'}
          onChange={v => {
            const firstModel = MODELS[v]?.[0]?.value || ''
            onChange({ ...config, provider: v, model: firstModel })
          }}
          options={[
            { value: 'claude', label: 'Anthropic (Claude)' },
            { value: 'openai', label: 'OpenAI' },
          ]}
        />
        <Select
          label="Model"
          value={config.model || ''}
          onChange={v => update('model', v)}
          options={models}
        />
      </Section>

      <Section title="Prompts">
        <TextArea
          label="System Prompt"
          value={config.systemPrompt || ''}
          onChange={v => update('systemPrompt', v)}
          placeholder="You are a helpful assistant..."
          rows={3}
        />
        <TextArea
          label="User Prompt"
          value={config.userPrompt || ''}
          onChange={v => update('userPrompt', v)}
          placeholder="Analyze the following: {{Input 1.output}}"
          rows={5}
          inputRef={promptRef}
        />
        <VariableChips nodeId={nodeId} onInsert={insertVariable} />
      </Section>

      <Section title="Parameters">
        <Slider
          label="Temperature"
          value={config.temperature ?? 0.7}
          onChange={v => update('temperature', v)}
          min={0}
          max={1}
          step={0.05}
        />
        <TextInput
          label="Max Tokens"
          value={config.maxTokens || 1024}
          onChange={v => update('maxTokens', v)}
          type="number"
        />
      </Section>
    </div>
  )
}
