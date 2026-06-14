# FlowPilot

**Build AI workflows visually. No code required.**

FlowPilot is a visual, drag-and-drop workflow builder for AI pipelines. Connect nodes, configure parameters, and run complex multi-step AI workflows in minutes instead of days. Change prompts, swap models, and add steps without touching code.

---

## The Problem

Building AI pipelines is repetitive. Every project requires the same components: LLM calls, data transformation, API integration, conditional logic. But each pipeline is wired differently, requiring custom code every time. Prototyping takes days. Changes require code redeployments.

## The Solution

FlowPilot provides a visual canvas where you drag and drop nodes, connect them, configure, and run. Build complex multi-step AI workflows in minutes. Pre-built templates for common patterns. Real-time execution monitoring. Change a prompt or swap a model without touching code.

---

## Features

- **Visual drag-and-drop workflow builder** — Intuitive canvas powered by React Flow
- **10 node types** — Input, LLM, Transform, API Call, Web Scrape, Condition, File, Merge, Output, MCP Tool
- **Multi-provider LLM support** — Claude (Anthropic) and OpenAI models
- **Variable system** — Pass data between nodes with `{{Node Title.output}}` syntax
- **Real-time execution monitoring** — Per-node status updates with running/success/error states
- **Conditional branching** — Route workflows based on conditions with true/false paths
- **Merge logic** — Combine multiple data streams with concatenate, JSON merge, array, or template strategies
- **Pre-built templates** — 5 ready-to-use workflow templates for common use cases
- **Execution history** — View past runs with full logs, output, and performance stats
- **Import/Export** — Share workflows as JSON files
- **Auto-save** — Automatic saving every 30 seconds
- **Cost estimation** — Token usage and estimated cost tracking per execution
- **Undo/Redo** — Full history with Cmd+Z / Cmd+Shift+Z
- **Keyboard shortcuts** — Cmd+S (save), Cmd+Enter (run), Cmd+D (duplicate), ? (help)
- **MCP Server support** — Call MCP tools from workflows + expose workflows as MCP tools
- **Dark theme** — Purpose-built dark interface optimized for focus

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 (Vite 8) | Fast builds, modern DX |
| Canvas | @xyflow/react v12 | Industry-standard node editor |
| State | Zustand | Lightweight, no boilerplate |
| Styling | Tailwind CSS v4 | Utility-first, rapid iteration |
| Icons | lucide-react | Lightweight, tree-shakable |
| Backend | Python 3.13 + FastAPI | Async-ready, auto-docs, type-safe |
| Database | SQLite | Zero config, file-based, sufficient for single-user |
| AI | Anthropic SDK + OpenAI SDK | Multi-provider LLM support |
| HTTP | httpx | Async HTTP client for API nodes |
| Scraping | BeautifulSoup4 | Reliable HTML parsing |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  React Flow Canvas  ←→  Zustand Store  ←→  API Client│
│  (Drag & Drop)          (State Mgmt)     (fetch)    │
└──────────────────────────┬──────────────────────────┘
                           │ /api/*
                           ▼
┌─────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                  │
│  Workflow CRUD  │  Execution Engine  │  Templates    │
└────────┬────────┴────────┬───────────┴──────────────┘
         │                 │
    ┌────▼────┐    ┌───────▼────────┐
    │ SQLite  │    │ Node Executors │
    │  (DB)   │    │ LLM, API, etc. │
    └─────────┘    └───────┬────────┘
                           │
                    ┌──────▼──────┐
                    │ External APIs│
                    │ Claude, GPT  │
                    │ Web, HTTP    │
                    └─────────────┘
```

---

## Node Types

| Node | Icon | Description | Use Case |
|------|------|-------------|----------|
| **Input** | ↓ | Workflow starting point | Accept user input (text, JSON, file) |
| **LLM Call** | 🧠 | Call an AI language model | Summarization, generation, classification |
| **Transform** | ↔ | Transform or reshape data | Templates, regex, JSON path, split/join |
| **API Call** | 🌐 | Make HTTP API requests | REST APIs, webhooks, external services |
| **Web Scrape** | 🔍 | Extract content from web pages | Research, data collection |
| **Condition** | ⑂ | Branch based on conditions | Route based on content, length, sentiment |
| **Merge** | ⊕ | Combine multiple inputs | Aggregate data from parallel paths |
| **File** | 📄 | Read or write files | Document processing, data I/O |
| **MCP Tool** | 🔌 | Call an MCP server tool | Connect to any MCP-compatible server |
| **Output** | ↑ | Workflow result endpoint | Display or save final results |

---

## Pre-built Templates

1. **Content Research & Writing** — Scrape the web for a topic, summarize findings, generate an article
2. **Lead Research Pipeline** — Scrape a company website, extract info, generate outreach email
3. **Document Summarizer** — Read a document, summarize with AI, format as markdown
4. **Multi-Source Data Aggregator** — Query two APIs in parallel, merge results, AI analysis
5. **Conditional Content Classifier** — Classify sentiment, branch to different responses

---

## Quick Start with Docker

The fastest way to get FlowPilot running:

```bash
git clone https://github.com/cbrahmam/AI-Workflow-Orchestrator.git
cd AI-Workflow-Orchestrator
cp .env.example .env          # Add your API keys
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) and start building workflows.

### One-Click Deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/flowpilot?referralCode=flowpilot)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/cbrahmam/AI-Workflow-Orchestrator)

---

## Getting Started (Manual)

### Prerequisites

- Node.js 18+
- Python 3.11+
- An Anthropic API key (for LLM nodes)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cbrahmam/AI-Workflow-Orchestrator.git
   cd AI-Workflow-Orchestrator
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp ../.env.example .env
   # Edit .env and add your API keys
   export ANTHROPIC_API_KEY=your_key_here
   ```

4. **Start the backend**
   ```bash
   python3 main.py
   # API runs at http://localhost:8000
   # Swagger docs at http://localhost:8000/docs
   ```

5. **Set up the frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Opens at http://localhost:5173
   ```

6. **Start building!**
   - Drag nodes from the sidebar onto the canvas
   - Connect nodes by dragging between handles
   - Click a node to configure it
   - Hit Run (or Cmd+Enter) to execute

---

## MCP Integration

FlowPilot supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) in two ways:

### 1. Call MCP Tools from Workflows

Use the **MCP Tool** node to call any MCP server:
- Point it at an MCP server URL (e.g., `http://localhost:3001/mcp`)
- Select a tool name and pass arguments
- Chain it with other nodes like any other integration

### 2. Expose Workflows as MCP Tools

FlowPilot acts as an MCP server itself. Any workflow you create automatically becomes an MCP tool that other apps can call.

**Connect Claude Desktop** — add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "flowpilot": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

**Endpoints:**
- `POST /mcp` — MCP JSON-RPC endpoint (tools/list, tools/call)
- `GET /mcp/info` — Human-readable list of available workflow tools

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List all workflows |
| POST | `/api/workflows` | Create a workflow |
| GET | `/api/workflows/:id` | Get a workflow |
| PUT | `/api/workflows/:id` | Update a workflow |
| DELETE | `/api/workflows/:id` | Delete a workflow |
| POST | `/api/workflows/:id/duplicate` | Duplicate a workflow |
| POST | `/api/workflows/:id/execute` | Execute a workflow |
| GET | `/api/workflows/:id/executions` | List execution history |
| GET | `/api/executions/:id` | Get execution details |
| POST | `/api/executions/:id/cancel` | Cancel an execution |
| GET | `/api/templates` | List templates |
| POST | `/api/templates/:id/use` | Create workflow from template |
| GET | `/api/templates/community` | List community templates |
| POST | `/mcp` | MCP JSON-RPC endpoint |
| GET | `/mcp/info` | MCP server info & tool list |

---

## Contributing

We welcome contributions! The easiest way to contribute is by **submitting a workflow template** — no code changes needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to submit a community template (just a JSON file + README)
- How to add new node types
- Code contribution guidelines

---

## License

MIT
