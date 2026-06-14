import { Section, TextInput, TextArea } from './FormFields'
import VariableChips from './VariableChips'

export default function MCPConfig({ nodeId, config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <Section title="MCP Server">
        <TextInput
          label="Server URL"
          value={config.serverUrl || ''}
          onChange={v => update('serverUrl', v)}
          placeholder="http://localhost:3001/mcp"
        />
        <p className="text-[10px] text-slate-500 -mt-1">
          The MCP server's HTTP endpoint (JSON-RPC)
        </p>
      </Section>

      <Section title="Tool">
        <TextInput
          label="Tool Name"
          value={config.toolName || ''}
          onChange={v => update('toolName', v)}
          placeholder="search_docs"
        />
        <TextArea
          label="Tool Arguments (JSON)"
          value={config.toolArgs || '{}'}
          onChange={v => update('toolArgs', v)}
          placeholder='{"query": "{{Input.output}}"}'
          rows={4}
        />
        <VariableChips nodeId={nodeId} onInsert={(v) => {
          const current = config.toolArgs || '{}'
          update('toolArgs', current.slice(0, -1) + (current.length > 2 ? ', ' : '') + `"input": "${v}"` + '}')
        }} />
      </Section>

      <Section title="Authentication">
        <TextInput
          label="Authorization Header"
          value={config.authHeader || ''}
          onChange={v => update('authHeader', v)}
          placeholder="Bearer sk-..."
          type="password"
        />
        <p className="text-[10px] text-slate-500 -mt-1">
          Optional — sent as the Authorization header
        </p>
      </Section>

      <div className="p-3 rounded-lg" style={{ background: '#1E1E2E' }}>
        <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">How it works</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Calls an MCP (Model Context Protocol) server tool via JSON-RPC.
          Connect any MCP-compatible server — file systems, databases, APIs, or custom tools.
        </p>
      </div>
    </div>
  )
}
