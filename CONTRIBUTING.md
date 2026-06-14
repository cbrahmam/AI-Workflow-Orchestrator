# Contributing to FlowPilot

Thanks for your interest in contributing! FlowPilot welcomes contributions of all kinds — bug fixes, new features, documentation, and especially **community workflow templates**.

---

## Quick Links

- [Submit a Template](#contributing-templates) — Easiest way to contribute
- [Report a Bug](https://github.com/cbrahmam/AI-Workflow-Orchestrator/issues/new?template=bug_report.md)
- [Request a Feature](https://github.com/cbrahmam/AI-Workflow-Orchestrator/issues/new?template=feature_request.md)

---

## Contributing Templates

The easiest way to contribute is by sharing a workflow template. No code changes required — just a JSON file and a PR.

### Steps

1. **Build your workflow** in FlowPilot and export it (Toolbar → Export)
2. **Create a template file** in `community-templates/`:

```
community-templates/
  your-template-name/
    template.json      # Required: the template definition
    README.md          # Required: description and usage guide
```

3. **Template JSON format:**

```json
{
  "name": "Your Template Name",
  "description": "One-line description of what this workflow does",
  "category": "content|research|data|automation|analysis",
  "author": "your-github-username",
  "tags": ["tag1", "tag2"],
  "nodes": [...],
  "edges": [...]
}
```

4. **Template README format:**

```markdown
# Template Name

## What it does
Brief description of the workflow.

## Nodes used
- List of node types used

## Configuration needed
- Any API keys or settings required

## Example output
What the user should expect when running this workflow.
```

5. **Submit a PR** with your template folder

### Template Guidelines

- Templates should be functional — a user should be able to use them immediately
- Include clear node titles that explain what each step does
- Use the `{{Node Title.output}}` variable syntax to connect data between nodes
- Keep descriptions concise but helpful
- Pick the most relevant category from: `content`, `research`, `data`, `automation`, `analysis`

---

## Contributing Code

### Setup

```bash
git clone https://github.com/cbrahmam/AI-Workflow-Orchestrator.git
cd AI-Workflow-Orchestrator

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### Development

```bash
# Terminal 1 — backend
cd backend && python3 main.py

# Terminal 2 — frontend
cd frontend && npm run dev
```

### Adding a New Node Type

1. Add the node definition to `frontend/src/utils/nodeTypes.js`
2. Create a config component in `frontend/src/components/config/`
3. Register it in `frontend/src/components/ConfigPanel.jsx`
4. Create the backend executor in `backend/services/nodes/`
5. Register it in `backend/services/node_registry.py`

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Test your changes with the dev server before submitting
- Update the README if adding a new feature
- Frontend build must pass: `cd frontend && npm run build`
- Follow existing code style (no linter config changes please)

### Commit Messages

We use conventional commits:

```
feat: add webhook trigger node
fix: resolve edge deletion crash on condition nodes
docs: add RAG pipeline template
```

---

## Adding Custom Nodes

Want to add a new node type? Here's the architecture:

### Frontend (React)

Each node needs:
- **Type definition** in `nodeTypes.js` — icon, color, handles, default config
- **Config panel** in `components/config/` — the settings UI shown when a node is selected
- **Registration** in `ConfigPanel.jsx` — mapping type → config component

### Backend (Python)

Each node needs:
- **Executor** in `services/nodes/` — a class with `async execute(input_data, config)` method
- **Registration** in `node_registry.py` — mapping type string → executor class

The execution engine resolves the DAG order automatically — you just need to implement the node's logic.

---

## Code of Conduct

Be kind, be constructive, be helpful. We're building tools to make AI accessible to everyone.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
