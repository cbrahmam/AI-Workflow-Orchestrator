import { Section, TextInput, TextArea } from './FormFields'
import VariableChips from './VariableChips'

export default function NotifyDiscordConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="Discord Webhook">
        <TextInput
          label="Webhook URL"
          value={config.webhookUrl || ''}
          onChange={v => update('webhookUrl', v)}
          placeholder="https://discord.com/api/webhooks/..."
          type="password"
        />
        <TextInput
          label="Username"
          value={config.username || 'FlowPilot'}
          onChange={v => update('username', v)}
        />
      </Section>

      <Section title="Message">
        <TextArea
          label="Message Template"
          value={config.messageTemplate || ''}
          onChange={v => update('messageTemplate', v)}
          placeholder="Workflow result: {{LLM Call.output}}"
          rows={3}
        />
        <VariableChips nodeId={nodeId} onInsert={(v) => update('messageTemplate', (config.messageTemplate || '') + v)} />
      </Section>
    </div>
  )
}
