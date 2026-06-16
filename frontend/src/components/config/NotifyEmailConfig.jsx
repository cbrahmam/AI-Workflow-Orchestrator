import { Section, TextInput, TextArea } from './FormFields'
import VariableChips from './VariableChips'

export default function NotifyEmailConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="Recipient">
        <TextInput
          label="To"
          value={config.to || ''}
          onChange={v => update('to', v)}
          placeholder="user@example.com"
        />
        <TextInput
          label="Subject"
          value={config.subject || 'FlowPilot Notification'}
          onChange={v => update('subject', v)}
        />
      </Section>

      <Section title="SMTP Settings">
        <TextInput
          label="SMTP Host"
          value={config.smtpHost || ''}
          onChange={v => update('smtpHost', v)}
          placeholder="smtp.gmail.com"
        />
        <TextInput
          label="SMTP Port"
          value={config.smtpPort ?? 587}
          onChange={v => update('smtpPort', parseInt(v) || 587)}
        />
        <TextInput
          label="Username"
          value={config.smtpUser || ''}
          onChange={v => update('smtpUser', v)}
          placeholder="your@email.com"
        />
        <TextInput
          label="Password"
          value={config.smtpPass || ''}
          onChange={v => update('smtpPass', v)}
          placeholder="App password"
          type="password"
        />
      </Section>

      <Section title="Body">
        <TextArea
          label="Email Body"
          value={config.bodyTemplate || ''}
          onChange={v => update('bodyTemplate', v)}
          placeholder="{{LLM Call.output}}"
          rows={4}
        />
        <VariableChips nodeId={nodeId} onInsert={(v) => update('bodyTemplate', (config.bodyTemplate || '') + v)} />
      </Section>
    </div>
  )
}
