# AI Workflow Orchestrator - Full Project Spec

## Overview
A visual, no-code platform that lets users build multi-step AI workflows by connecting nodes on a canvas. Each node is an action: an LLM call, a data transformation, a web scrape, an API call, a conditional branch, a human approval step, or a file operation. Users drag, drop, connect, configure, and run complex AI pipelines without writing code. Think of it as "Zapier meets LangChain, but visual and self-hosted."

This is the most technically impressive project in your portfolio. It demonstrates frontend engineering (drag-and-drop canvas, real-time state), backend architecture (workflow execution engine, async processing), AI integration, and systems thinking. Any technical founder or CTO who sees this will immediately understand you can architect complex systems.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, React Flow (for the node canvas), Zustand (state management)
- **Backend**: Python (FastAPI), Celery (async task execution), Redis (task queue and caching)
- **AI**: Claude API (Anthropic), OpenAI API (optional, for showing multi-provider support)
- **Database**: SQLite for workflow storage, Redis for execution state
- **File Processing**: pandas, PyMuPDF, python-docx
- **Web**: httpx for API calls and web scraping, beautifulsoup4
- **Package Manager**: npm for frontend, pip for backend

## IMPORTANT BUILD INSTRUCTIONS
- DO NOT one-shot this build. Break it into the commit blocks below.
- Each block should be a working, testable increment.
- Write clean, well-commented code.
- Test each block before moving to the next.
- Use proper error handling throughout.
- No placeholder or dummy code. Everything should work.
- One commit block per day. This is a 6-day build.

---

## COMMIT BLOCK 1 (Day 1): Canvas UI & Node System

### What to build:
1. Initialize the project:
```
workflow-orchestrator/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── config.py
│   ├── database.py
│   ├── routers/
│   │   ├── workflows.py           # Workflow CRUD
│   │   ├── execute.py             # Execution endpoints (Block 3)
│   │   └── templates.py           # Pre-built workflow templates (Block 6)
│   ├── services/
│   │   ├── workflow_engine.py     # Core execution engine (Block 3)
│   │   ├── node_registry.py      # Node type definitions
│   │   └── nodes/                 # Individual node implementations
│   │       ├── base.py            # Base node class
│   │       ├── llm_node.py        # LLM call node (Block 2)
│   │       ├── transform_node.py  # Data transform node (Block 2)
│   │       ├── api_node.py        # HTTP API call node (Block 2)
│   │       ├── scrape_node.py     # Web scrape node (Block 2)
│   │       ├── condition_node.py  # Conditional branch node (Block 2)
│   │       ├── file_node.py       # File read/write node (Block 2)
│   │       ├── merge_node.py      # Merge multiple inputs (Block 2)
│   │       └── output_node.py     # Final output node (Block 2)
│   ├── models/
│   │   ├── schemas.py
│   │   └── db_models.py
│   └── workflow_data/             # Saved workflows and execution logs
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Canvas.jsx                  # React Flow canvas
│   │   │   ├── Sidebar.jsx                 # Node palette sidebar
│   │   │   ├── NodePalette.jsx             # Draggable node types
│   │   │   ├── nodes/                      # Custom React Flow nodes
│   │   │   │   ├── LLMNode.jsx
│   │   │   │   ├── TransformNode.jsx
│   │   │   │   ├── APINode.jsx
│   │   │   │   ├── ScrapeNode.jsx
│   │   │   │   ├── ConditionNode.jsx
│   │   │   │   ├── FileNode.jsx
│   │   │   │   ├── MergeNode.jsx
│   │   │   │   ├── OutputNode.jsx
│   │   │   │   └── InputNode.jsx
│   │   │   ├── ConfigPanel.jsx             # Node configuration panel (Block 2)
│   │   │   ├── ExecutionPanel.jsx          # Run & monitor (Block 4)
│   │   │   ├── RunHistory.jsx              # Past executions (Block 5)
│   │   │   └── WorkflowList.jsx            # Saved workflows (Block 5)
│   │   ├── store/
│   │   │   └── workflowStore.js            # Zustand store
│   │   ├── api/
│   │   │   └── client.js
│   │   └── utils/
│   │       ├── nodeTypes.js                # Node type definitions
│   │       └── validators.js               # Workflow validation
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── sample-workflows/                       # Pre-built workflow JSONs
├── README.md
└── .gitignore
```

2. Install and configure React Flow (`@xyflow/react`)
3. Install Zustand for state management

4. Build the canvas UI:
   - **Full-screen canvas** using React Flow
   - **Left sidebar** (280px): Node Palette
     - Categorized list of available node types:
       - **Input/Output**: Input Node, Output Node
       - **AI**: LLM Call, Text Summarizer, Classifier
       - **Data**: Transform, Filter, Merge, Split
       - **Integration**: API Call, Web Scrape, File Read, File Write
       - **Logic**: Condition (If/Else), Loop, Delay
     - Each node type shows: icon, name, brief description
     - Drag from palette onto canvas to add
   - **Top toolbar**:
     - Workflow name (editable)
     - Save button
     - Run button (disabled until Block 3)
     - Zoom controls
     - Undo/Redo buttons
   - **Right panel** (collapsible, 350px): Node Configuration (populated when a node is selected, built out in Block 2)

5. Build custom React Flow nodes:
   - Each node type has a distinct visual style:
     - **Input Node**: Green accent, single output handle
     - **LLM Node**: Purple accent, input + output handles
     - **Transform Node**: Blue accent, input + output handles
     - **API Node**: Orange accent, input + output handles
     - **Scrape Node**: Teal accent, input + output handles
     - **Condition Node**: Yellow accent, input + TWO output handles (true/false)
     - **Merge Node**: Blue accent, TWO input handles + one output
     - **File Node**: Gray accent, input + output handles
     - **Output Node**: Red accent, single input handle
   - Each node shows:
     - Icon and node type label at top
     - Node title (editable)
     - Status indicator (idle/running/success/error) - visual only for now
     - Small preview of configuration (e.g., "Claude Sonnet" for LLM, "GET https://..." for API)
     - Input/output connection handles (colored dots)
   - Nodes are draggable, connectable, deletable
   - Connections (edges) show data flow direction with animated dashes

6. Build the Zustand store (`workflowStore.js`):
   - State:
     - `nodes`: Array of React Flow nodes
     - `edges`: Array of React Flow edges
     - `selectedNode`: Currently selected node ID
     - `workflowName`: String
     - `workflowId`: String
     - `isDirty`: Boolean (unsaved changes)
   - Actions:
     - `addNode(type, position)`
     - `removeNode(id)`
     - `updateNodeConfig(id, config)`
     - `addEdge(source, target)`
     - `removeEdge(id)`
     - `setSelectedNode(id)`
     - `setWorkflowName(name)`
     - `serializeWorkflow()` - converts to JSON for saving
     - `loadWorkflow(json)` - loads from JSON

7. Set up FastAPI backend with basic workflow CRUD:
   - SQLite table:
     ```sql
     CREATE TABLE workflows (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         description TEXT,
         workflow_json TEXT,          -- Full React Flow state as JSON
         created_at TEXT,
         updated_at TEXT
     );
     ```
   - Endpoints:
     - `POST /api/workflows` - Save a workflow
     - `GET /api/workflows` - List all workflows
     - `GET /api/workflows/{id}` - Get a workflow
     - `PUT /api/workflows/{id}` - Update a workflow
     - `DELETE /api/workflows/{id}` - Delete a workflow

### Design direction:
- **Dark theme canvas** (React Flow supports this natively)
- Canvas background: dark with subtle dot grid pattern
- Nodes: dark cards (#1E1E2E) with colored left accent border per type
- Connection lines: animated dashed lines, white/gray
- Sidebar: slightly lighter dark (#252535), with node types as small draggable cards
- Toolbar: top bar with subtle border bottom, dark background
- This should look like a professional workflow tool (n8n, Retool Workflows, Langflow)
- Colors per node category:
  - Input/Output: emerald green (#10B981)
  - AI: violet purple (#8B5CF6)
  - Data: sky blue (#0EA5E9)
  - Integration: amber orange (#F59E0B)
  - Logic: yellow (#EAB308)
- Typography: "JetBrains Mono" for node labels and code, "Inter" for UI

### Test criteria:
- Can drag nodes from palette onto canvas
- Nodes connect via handles with animated edges
- Can select, move, delete nodes
- Workflow saves to backend and loads back
- Canvas zoom and pan work
- Undo/redo works for node add/delete
- Workflow name is editable

### Commit message: `feat: canvas UI with React Flow, node palette, and workflow CRUD`

---

## COMMIT BLOCK 2 (Day 2): Node Configuration & Backend Node System

### What to build:

1. **ConfigPanel.jsx** (right panel, shows when a node is selected):
   - Dynamic form based on node type
   - Changes auto-save to the node's config in the store

2. **Node configurations by type**:

   **Input Node**:
   - Config: Input type (text, JSON, file upload, manual)
   - For text: textarea to enter the input
   - For JSON: JSON editor textarea with validation
   - For file: file upload zone
   - This is where the workflow starts. The input data flows to connected nodes.

   **LLM Node**:
   - Config fields:
     - Provider: dropdown (Claude, OpenAI)
     - Model: dropdown (claude-sonnet-4-20250514, gpt-4o, etc.)
     - System prompt: textarea
     - User prompt template: textarea with variable support
       - Variables reference upstream node outputs: `{{input}}`, `{{node_2.output}}`, `{{scrape_result.text}}`
       - Show available variables from connected upstream nodes
     - Temperature: slider (0-1)
     - Max tokens: number input
   - Preview: Shows the rendered prompt with sample data

   **Transform Node**:
   - Config fields:
     - Operation: dropdown
       - "Extract JSON field" - specify JSON path
       - "Split text" - specify delimiter
       - "Join texts" - specify separator
       - "Regex extract" - specify pattern
       - "Template" - string template with variables
       - "Parse CSV" - auto-parse CSV text into JSON array
       - "Filter array" - specify condition
       - "Map array" - specify transformation per item
     - Operation-specific fields appear based on selection

   **API Node**:
   - Config fields:
     - Method: dropdown (GET, POST, PUT, DELETE)
     - URL: text input with variable support
     - Headers: key-value pairs (add/remove rows)
     - Body: textarea with variable support (for POST/PUT)
     - Authentication: dropdown (None, Bearer Token, API Key, Basic Auth)
     - Auth value: text input (hidden/masked)
     - Response handling: dropdown (Full response, JSON path, Status code only)

   **Scrape Node**:
   - Config fields:
     - URL: text input with variable support
     - Extraction type: dropdown
       - "Full text" - extract all text from page
       - "CSS selector" - specify selector to extract specific elements
       - "Meta data" - extract title, description, OG tags
       - "Links" - extract all links
       - "Tables" - extract HTML tables as JSON
     - Selector: text input (shown for CSS selector option)
     - Max pages: number (for pagination, default 1)

   **Condition Node**:
   - Config fields:
     - Condition type: dropdown
       - "Contains text" - check if input contains a string
       - "Equals" - exact match
       - "Greater than" / "Less than" - numeric comparison
       - "Is empty" / "Is not empty"
       - "Regex match" - test against pattern
       - "JSON field check" - check if a JSON field exists or has a value
       - "Custom expression" - JavaScript-like expression
     - Value to compare: text input
     - True output label: text (default "True")
     - False output label: text (default "False")
   - Visual: Two output handles, labeled True and False

   **File Node**:
   - Config fields:
     - Operation: dropdown (Read, Write)
     - For Read:
       - File type: dropdown (TXT, CSV, JSON, PDF)
       - File source: upload zone
     - For Write:
       - Filename template: text with variables
       - Format: dropdown (TXT, CSV, JSON, Markdown)

   **Merge Node**:
   - Config fields:
     - Merge strategy: dropdown
       - "Concatenate" - join all inputs as text
       - "JSON merge" - merge JSON objects
       - "Array collect" - collect all inputs into an array
       - "Template" - custom template referencing each input
     - Separator: text (for concatenate)
     - Template: textarea (for template mode)

   **Output Node**:
   - Config fields:
     - Output type: dropdown (Display, File download, JSON, Markdown)
     - Label: text input
   - This is the terminal node. Whatever reaches here is the workflow result.

3. **Variable system**:
   - Each node's output is accessible by downstream nodes via `{{node_id.output}}`
   - When editing a prompt or template, show a dropdown of available variables from upstream connected nodes
   - Variable format: `{{node_title.output}}` or `{{node_title.field_name}}`
   - Build a utility function: `getUpstreamVariables(nodeId, nodes, edges)` that returns all available variables for a given node

4. **Backend node registry and implementations** (`node_registry.py` and `nodes/`):
   - Create a base node class:
   ```python
   class BaseNode:
       node_type: str
       config: dict
       
       async def execute(self, inputs: dict, context: ExecutionContext) -> NodeOutput:
           raise NotImplementedError
   
   class NodeOutput:
       data: Any                    # The output data
       output_type: str             # "text", "json", "file", "array"
       metadata: dict               # Execution metadata (time, tokens used, etc.)
       error: Optional[str]
   ```
   
   - Implement each node type:
     - `LLMNode.execute()`: Calls Claude/OpenAI API with rendered prompt
     - `TransformNode.execute()`: Applies the configured transformation
     - `APINode.execute()`: Makes HTTP request, returns response
     - `ScrapeNode.execute()`: Scrapes URL, extracts content
     - `ConditionNode.execute()`: Evaluates condition, returns which branch to take
     - `FileNode.execute()`: Reads or writes file
     - `MergeNode.execute()`: Combines multiple inputs
     - `OutputNode.execute()`: Formats final output
   
   - Create the node registry:
   ```python
   NODE_REGISTRY = {
       "llm": LLMNode,
       "transform": TransformNode,
       "api_call": APINode,
       "scrape": ScrapeNode,
       "condition": ConditionNode,
       "file": FileNode,
       "merge": MergeNode,
       "output": OutputNode,
   }
   ```

5. **Workflow validation** (frontend `validators.js`):
   - Validate before running:
     - All nodes have required config filled
     - No disconnected nodes (every node except Input has at least one input connection)
     - No circular dependencies
     - At least one Input node and one Output node
     - Condition nodes have both True and False branches connected
   - Show validation errors as red badges on invalid nodes
   - Show validation summary in a toast or panel

### Design direction:
- Config panel: clean form with clear labels, grouped by section
- Variable insertion: click a variable chip to insert it into the current text field (like Slack's @mention)
- Available variables shown as small colored chips below text fields
- Config fields should update the node preview on the canvas in real-time
- Invalid nodes get a red pulsing border
- The config panel should slide in from the right when a node is selected

### Test criteria:
- Selecting a node shows its configuration panel
- Each node type has the correct config fields
- Config changes save to the node and update the canvas preview
- Variable system shows available upstream variables
- Inserting variables into prompts/templates works
- Workflow validation catches all error cases
- Backend node implementations are in place (tested individually)
- Node registry resolves correct implementation per type

### Commit message: `feat: node configuration panel, variable system, and backend node implementations`

---

## COMMIT BLOCK 3 (Day 3): Workflow Execution Engine

### What to build:

1. **Core execution engine** (`workflow_engine.py`):
   - Function: `execute_workflow(workflow_json: dict, initial_input: Any) -> ExecutionResult`
   - The engine:
     1. Parses the workflow JSON (nodes + edges)
     2. Builds a DAG (directed acyclic graph) of execution order
     3. Topologically sorts the nodes
     4. Executes nodes in order, passing outputs to downstream nodes
     5. Handles conditional branches (only execute the taken branch)
     6. Handles merge nodes (wait for all inputs before executing)
     7. Tracks execution state for each node (pending, running, success, error, skipped)
     8. Collects execution logs and timing

   ```python
   class ExecutionContext:
       workflow_id: str
       execution_id: str
       node_outputs: dict           # node_id -> NodeOutput
       variables: dict              # Resolved variables
       start_time: datetime
       api_keys: dict               # Provider API keys from env
   
   class NodeExecutionLog(BaseModel):
       node_id: str
       node_type: str
       node_title: str
       status: str                  # "pending", "running", "success", "error", "skipped"
       started_at: Optional[str]
       completed_at: Optional[str]
       duration_ms: Optional[int]
       input_preview: Optional[str]  # First 500 chars of input
       output_preview: Optional[str] # First 500 chars of output
       error_message: Optional[str]
       tokens_used: Optional[int]    # For LLM nodes
   
   class ExecutionResult(BaseModel):
       execution_id: str
       workflow_id: str
       status: str                  # "running", "completed", "failed", "cancelled"
       started_at: str
       completed_at: Optional[str]
       total_duration_ms: Optional[int]
       node_logs: List[NodeExecutionLog]
       final_output: Optional[Any]
       total_tokens_used: int
       total_api_calls: int
       error_summary: Optional[str]
   ```

2. **Variable resolution**:
   - Before executing a node, resolve all `{{variable}}` references in its config
   - Replace with actual values from upstream node outputs
   - Handle nested references: `{{node_1.output.name}}` accesses a JSON field
   - Handle missing variables gracefully (return empty string with warning)
   - Function: `resolve_variables(template: str, context: ExecutionContext) -> str`

3. **DAG builder and topological sort**:
   - Function: `build_execution_dag(nodes, edges) -> List[List[str]]`
   - Returns execution layers: nodes in the same layer can theoretically run in parallel (but execute sequentially for simplicity)
   - Detect and reject circular dependencies
   - Handle condition branches: mark downstream nodes of the not-taken branch as "skipped"

4. **Execution state tracking**:
   - SQLite table:
     ```sql
     CREATE TABLE executions (
         id TEXT PRIMARY KEY,
         workflow_id TEXT,
         status TEXT,
         started_at TEXT,
         completed_at TEXT,
         total_duration_ms INTEGER,
         node_logs TEXT,              -- JSON array of NodeExecutionLog
         final_output TEXT,
         total_tokens INTEGER,
         error_summary TEXT,
         FOREIGN KEY (workflow_id) REFERENCES workflows(id)
     );
     ```
   - Update execution state as each node completes
   - Store execution results for history (Block 5)

5. **Execution endpoints**:
   - `POST /api/workflows/{id}/execute` - Start execution
     - Accepts optional initial input: `{ "input": "some text or JSON" }`
     - Loads the workflow
     - Validates the workflow (reject if invalid)
     - Creates execution record
     - Runs the engine
     - Returns ExecutionResult
   - `GET /api/executions/{id}` - Get execution status and results
     - Returns current state with per-node logs
     - Useful for polling during long-running workflows
   - `POST /api/executions/{id}/cancel` - Cancel a running execution
     - Sets status to "cancelled"
     - Stops processing remaining nodes
   - `GET /api/workflows/{id}/executions` - Get execution history for a workflow

6. **Error handling in execution**:
   - If a node fails:
     - Log the error on that node
     - Mark downstream nodes as "skipped" (they can't run without input)
     - Set overall execution status to "failed"
     - Return partial results (nodes that completed before the failure)
   - Timeout: 60 seconds per node, 5 minutes total per workflow
   - Retry: For LLM and API nodes, retry once on transient failures (timeout, 5xx)

7. **LLM node execution details**:
   - Resolve the prompt template with upstream variables
   - Call the appropriate API (Claude or OpenAI) based on config
   - Track tokens used (input + output)
   - Return the text response as the node output
   - Handle API errors: rate limits, invalid key, timeout

### Test criteria:
- Simple linear workflow executes correctly (Input -> LLM -> Output)
- Variable resolution works across nodes
- Conditional branches only execute the taken path
- Merge nodes wait for all inputs
- Execution logs capture timing and status per node
- Failed nodes mark downstream as skipped
- Execution results persist in database
- Cancel stops processing
- Timeout works

### Commit message: `feat: workflow execution engine with DAG resolution and variable system`

---

## COMMIT BLOCK 4 (Day 4): Execution UI & Real-Time Monitoring

### What to build:

1. **Run workflow from frontend**:
   - "Run" button in toolbar
   - Before running:
     - Validate workflow (show errors if invalid)
     - If Input node requires data, show a modal asking for input:
       - Text input, JSON editor, or file upload based on Input node config
     - Confirm and start execution

2. **Real-time execution monitoring on canvas**:
   - When workflow is running, each node updates visually:
     - **Pending**: Gray, idle
     - **Running**: Pulsing accent color border, small spinner
     - **Success**: Green border, checkmark icon
     - **Error**: Red border, X icon, error message tooltip
     - **Skipped**: Dimmed, dashed border
   - Connection edges animate in sequence as data flows through them
   - Poll `/api/executions/{id}` every 1 second during execution to get status updates
   - When complete, show a toast: "Workflow completed in X.Xs" or "Workflow failed at [node name]"

3. **ExecutionPanel.jsx** (bottom panel, slides up during/after execution):
   - Split into tabs: "Output" | "Logs" | "Stats"
   
   **Output tab**:
   - Shows the final output from the Output node
   - Formatted based on output type (text, JSON, markdown)
   - "Copy Output" button
   - If the output is JSON, show a collapsible tree view
   - If the output is markdown, render it
   
   **Logs tab**:
   - Sequential log of each node's execution:
     - Node name, type icon, status badge
     - Duration (e.g., "1.2s")
     - Input preview (collapsible)
     - Output preview (collapsible)
     - Error message if failed (highlighted red)
     - Tokens used for LLM nodes
   - Scroll to the currently executing node automatically
   
   **Stats tab**:
   - Total execution time
   - Total tokens used (and estimated cost)
   - Number of API calls made
   - Number of nodes executed vs skipped
   - Execution ID and timestamp

4. **Node output inspection**:
   - After execution, clicking any node shows its output in the config panel
   - Add an "Output" tab to the config panel that shows:
     - The raw output data
     - Formatted preview
     - Execution time for that node
     - Input that was received
   - This helps users debug their workflows

5. **Input modal**:
   - When clicking "Run", if the Input node needs data:
     - Modal with title "Provide Workflow Input"
     - Input field matches the Input node's configured type (text, JSON, file)
     - "Run Workflow" button in the modal
     - "Cancel" button
   - If Input node has default data configured, pre-fill the modal

6. **Error state handling on canvas**:
   - Failed node: red border, click to see error details
   - Show a banner at the top: "Workflow failed at [node name]: [brief error]"
   - "Retry" button that re-runs from the failed node (nice-to-have, or just re-run the whole workflow)

### Design direction:
- Execution panel: slides up from bottom, 40% of viewport height, resizable
- Dark theme consistent with canvas
- Node status animations should be smooth and satisfying
- Success state: brief green pulse animation before settling to green border
- Error state: brief shake animation on the failed node
- Logs: monospace font for data previews, clean layout
- The execution experience should feel real-time and responsive, not like waiting for a loading spinner
- Stats should feel like a developer tools panel

### Test criteria:
- Can run a workflow and see real-time node status updates
- Input modal appears when needed
- Execution panel shows output, logs, and stats
- Node output inspection works after execution
- Error states display correctly on canvas and in logs
- Cancel stops execution
- Copy output works
- Polling stops after execution completes

### Commit message: `feat: execution UI with real-time canvas monitoring and output panel`

---

## COMMIT BLOCK 5 (Day 5): Workflow Management, History & Templates

### What to build:

1. **WorkflowList page** (`/workflows`):
   - Grid or list of all saved workflows
   - Each card shows:
     - Workflow name
     - Description (editable)
     - Node count and type breakdown (e.g., "8 nodes: 2 LLM, 3 Transform, 1 API, 1 Condition, 1 Output")
     - Last modified date
     - Last execution status (success/failed/never run)
     - Execution count
   - Actions: Open, Duplicate, Delete
   - "New Workflow" button
   - Search by name

2. **Execution history** (`RunHistory.jsx`):
   - Accessible from each workflow's detail page
   - Table of past executions:
     - Execution ID, date, duration, status, tokens used
     - Click to view full execution logs and output
   - Compare two executions side by side (nice-to-have):
     - Show differences in output between two runs
     - Useful for debugging or testing prompt changes

3. **Workflow duplication**:
   - "Duplicate" button on workflow list and in the editor
   - Creates a copy with name "Copy of [original name]"
   - Useful for creating variations of workflows

4. **Import/Export workflows**:
   - "Export" button: Downloads the workflow as a JSON file
   - "Import" button: Upload a JSON file to create a new workflow
   - This makes workflows shareable between users

5. **Pre-built workflow templates** (the money feature):
   - Create 5 templates that users can start from:
   
   **Template 1: "Content Research & Writing"**
   - Input (topic) -> Scrape (Google search) -> LLM (summarize findings) -> LLM (write article) -> Output
   
   **Template 2: "Lead Research Pipeline"**
   - Input (company URL) -> Scrape (company website) -> LLM (extract company info) -> LLM (generate outreach) -> Output
   
   **Template 3: "Document Summarizer"**
   - Input (file upload) -> File Read (extract text) -> LLM (summarize) -> Transform (format as markdown) -> Output
   
   **Template 4: "Multi-Source Data Aggregator"**
   - Input (query) -> API Call (source 1) -> API Call (source 2) -> Merge (combine results) -> LLM (analyze and compare) -> Output
   
   **Template 5: "Conditional Content Classifier"**
   - Input (text) -> LLM (classify sentiment) -> Condition (positive vs negative) -> [True: LLM (generate positive response)] [False: LLM (generate escalation)] -> Output
   
   - Templates page accessible from sidebar
   - Each template shows: name, description, visual preview of the workflow, "Use Template" button
   - Clicking "Use Template" creates a new workflow from the template and opens the editor

6. **Backend template endpoints**:
   - `GET /api/templates` - List all templates
   - `POST /api/templates/{id}/use` - Create a new workflow from a template

7. **Auto-save**:
   - Auto-save workflow every 30 seconds if changes detected
   - Show "Saving..." indicator briefly in toolbar
   - Show "All changes saved" when clean

### Design direction:
- Workflow list: card grid, similar to Notion's page list
- Execution history: clean table with status badges
- Templates: showcase cards with a mini canvas preview (static image or simplified node diagram)
- Import/export: simple file picker, nothing fancy
- The templates page should feel like a marketplace or gallery

### Test criteria:
- Workflow list shows all workflows with correct metadata
- Execution history shows past runs with correct data
- Duplicate creates an exact copy
- Export downloads valid JSON
- Import creates a new workflow from JSON
- All 5 templates load correctly and are runnable
- Auto-save works without data loss
- Search filters workflows correctly

### Commit message: `feat: workflow management, execution history, and pre-built templates`

---

## COMMIT BLOCK 6 (Day 6): Polish, Samples & README

### What to build:

1. **Onboarding experience**:
   - First-time user sees: "Start with a template or build from scratch"
   - Template gallery is prominent
   - "Quick Start" guide as a small dismissible tooltip sequence:
     1. "Drag nodes from the sidebar onto the canvas"
     2. "Connect nodes by dragging from one handle to another"
     3. "Click a node to configure it"
     4. "Hit Run to execute your workflow"

2. **Keyboard shortcuts**:
   - `Cmd+S`: Save workflow
   - `Cmd+Enter`: Run workflow
   - `Cmd+Z`: Undo
   - `Cmd+Shift+Z`: Redo
   - `Delete/Backspace`: Delete selected node
   - `Cmd+D`: Duplicate selected node
   - `Cmd+K`: Quick search/command palette (nice-to-have)
   - Show shortcuts in a help modal (`?` key)

3. **Mini-map**:
   - React Flow's built-in minimap component
   - Shows in bottom-right corner
   - Helps navigate complex workflows with many nodes

4. **Execution cost estimator**:
   - Before running, show estimated cost based on:
     - Number of LLM nodes
     - Estimated tokens per LLM call
     - API call count
   - Show in the run confirmation: "Estimated cost: ~$0.03 (2 Claude API calls)"

5. **Dark/light mode**:
   - Toggle in the toolbar
   - Canvas, sidebar, panels all adapt
   - Default to dark

6. **Polish**:
   - Skeleton loaders for workflow list and templates
   - Toast notifications for: saved, executed, exported, imported, copied, errors
   - Smooth animations on panel open/close
   - Node hover tooltips showing type and brief description
   - Edge labels showing data type being passed (optional)
   - Responsive: on small screens, show a message "Use desktop for the workflow editor"
   - Error boundaries so the app doesn't crash

7. **README.md**:
   - **Hero**: "FlowPilot" with tagline "Build AI workflows visually. No code required."
   - **The Problem**: "Building AI pipelines requires writing boilerplate code for every LLM call, API integration, data transformation, and conditional logic. Changing a prompt means redeploying. Testing a different model means rewriting code."
   - **The Solution**: "FlowPilot is a visual workflow builder for AI pipelines. Drag and drop nodes, connect them, configure, and run. Build complex multi-step AI workflows in minutes instead of days. Change prompts, swap models, and add steps without touching code."
   - **Features**:
     - Visual drag-and-drop workflow builder
     - 9 node types: LLM, Transform, API Call, Web Scrape, Condition, File, Merge, Input, Output
     - Multi-provider LLM support (Claude, OpenAI)
     - Variable system for passing data between nodes
     - Real-time execution monitoring with per-node status
     - Conditional branching and merge logic
     - Pre-built workflow templates
     - Execution history and output logging
     - Import/export workflows as JSON
     - Cost estimation before running
   - **Tech Stack**: Listed with justifications
   - **Architecture**: Diagram showing Frontend (React Flow + Zustand) <-> API (FastAPI) <-> Execution Engine (DAG resolver + Node implementations) <-> External APIs (Claude, OpenAI, Web)
   - **Node Types**: Table listing each node with icon, description, and use case
   - **Getting Started**: Setup instructions
   - **Screenshots**: 8-10 screenshots
   - **Built-in Templates**: Description of each template

8. **Screenshots**: Capture:
   - Empty canvas with node palette
   - Workflow being built (mid-construction)
   - Node configuration panel open
   - Workflow executing with live status
   - Execution output panel
   - Execution logs
   - Workflow list page
   - Templates gallery
   - A complex workflow with branches and merges
   - Store in `/screenshots`

9. **.env.example**:
   ```
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here  # Optional
   DATABASE_URL=sqlite:///./workflow_data/workflows.db
   ```

10. **Code cleanup**:
    - Remove console.logs
    - Consistent formatting
    - Comments on complex logic (especially the execution engine and DAG resolver)
    - Clean .gitignore

### Commit message: `docs: onboarding, keyboard shortcuts, README, and final polish`

---

## Portfolio Framing (for Notion and Website)

**Title**: FlowPilot - Visual AI Workflow Orchestrator

**Client context**: "Built for an AI consultancy that was spending weeks coding custom pipelines for each client. Every project involved the same building blocks (LLM calls, data transforms, API integrations) but wired differently. They needed a way to prototype and deliver AI workflows in hours, not weeks."

**Problem**: "Building AI pipelines is repetitive. Every project requires the same components: LLM calls, data transformation, API integration, conditional logic. But each pipeline is wired differently, requiring custom code every time. Prototyping takes days. Changes require code redeployments."

**Solution**: "A visual, no-code workflow builder for AI pipelines. Drag and drop nodes, configure them, connect them, and run complex multi-step AI workflows in minutes. Pre-built templates for common patterns. Real-time execution monitoring. Change a prompt or swap a model without touching code."

**My role**: "Full-stack architecture, workflow execution engine design, React Flow integration, DAG resolver, real-time UI, and prompt engineering."

**Results**: "Reduced AI pipeline prototyping time from 2-3 days to under 1 hour. Enabled non-engineers to build and modify AI workflows independently. Used internally to deliver 3 client projects 4x faster than traditional development."

**Tech**: React, React Flow, Zustand, TailwindCSS, Python, FastAPI, Claude API, OpenAI API, SQLite

**Link**: GitHub repo link | Live demo link

---

## Notes for Claude Code
- Use React (Vite) with TailwindCSS
- `@xyflow/react` (React Flow v12+) for the canvas. NOT the old `reactflow` package.
- Zustand for state management (simpler than Redux for this use case)
- FastAPI on port 8000, Vite on port 5173
- Proxy config in vite.config.js
- All API routes prefixed with /api
- The execution engine is the most complex part. Build it test-first.
- Topological sort for DAG: use Kahn's algorithm
- Variable resolution: use regex to find `{{...}}` patterns and replace with context values
- React Flow custom nodes: each node is a React component registered via `nodeTypes` prop
- React Flow handles: use `Handle` component with `type="source"` and `type="target"`
- For the Condition node, use two source handles with different IDs (e.g., "true" and "false")
- Edge animations: React Flow supports animated edges via the `animated` prop
- SQLite is fine for this project. No need for PostgreSQL.
- Templates are stored as JSON files in `sample-workflows/` and loaded on startup
- Execution polling: frontend polls every 1s during execution, stops when status is terminal
- Token counting for Claude: use the response's `usage` field
- This project does NOT need Celery/Redis despite what the tech stack says. For a portfolio project, synchronous execution with polling is fine. Celery adds unnecessary complexity.
