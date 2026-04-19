Here is your complete, unified Replit Agent brief:

---

**REPLIT AGENT BRIEF — MetaFlow AI**

---

## 1. APP OVERVIEW

**App Name:** MetaFlow AI
**One-line description:** A no-code, drag-and-drop workflow builder for data teams that automates metadata-driven monitoring, PII detection, and alerting — powered by AI.
**Core problem it solves:** Data engineers and analysts waste hours manually monitoring data pipelines, tracking PII exposure, and reacting to failures. Existing tools like Zapier and n8n are generic and not data-aware. MetaFlow AI gives teams a visual, intelligent workflow builder that understands metadata concepts out of the box.
**Target user:** Data Engineers, Data Analysts, and small backend teams managing data pipelines.

---

## 2. FULL FEATURE LIST

**Core (MVP — must work for demo):**
- Drag-and-drop workflow canvas using React Flow
- Pre-built node types: Input nodes (Fetch Failed Tables, Fetch PII Data), Logic nodes (Filter by tag), Action nodes (Send Notification, Generate Report)
- Node connection via edges (visual arrows)
- JSON export of the full workflow (nodes + edges)
- Workflow execution engine that processes nodes sequentially
- Output/results panel showing execution logs, filtered data, and alerts
- Real-time execution visualization: nodes highlight as they execute (green = done, yellow = running, red = error)

**Nice-to-Have (include — judges will love these):**
- AI Workflow Generator: text input like "Notify me when PII data fails" → auto-generates connected nodes on canvas
- 3 pre-built templates: "Data Failure Alert", "PII Monitoring", "Weekly Data Summary"
- Execution step animation with delay between node highlights
- Node detail side panel (click a node to see config)
- Mock Slack notification output in results panel
- Dark mode toggle

---

## 3. TECH STACK

**Frontend:**
- React.js (Vite)
- React Flow (`reactflow` npm package) — for the workflow canvas
- Tailwind CSS — for all styling
- `lucide-react` — for icons
- `react-router-dom` — for routing
- `axios` — for API calls

**Backend:**
- Node.js with Express.js
- `cors` middleware for cross-origin requests
- `@google/generative-ai` npm package for Gemini API
- `dotenv` for environment variables
- No database required — use in-memory JS arrays/objects for state

**AI:**
- Google Gemini API via `@google/generative-ai`
- Use `gemini-1.5-flash` model for AI workflow generation from natural language

**Data:**
- Mock OpenMetadata responses hardcoded in Express server (no real API key needed for MVP)
- Mock Slack webhook — log to output panel instead of real HTTP call

**Frontend dependencies:** `reactflow`, `tailwindcss`, `lucide-react`, `axios`, `react-router-dom`
**Backend dependencies:** `express`, `cors`, `@google/generative-ai`, `dotenv`

---

## 4. PAGES & USER FLOW

### Page 1: Landing / Home (`/`)
- App name "MetaFlow AI" with tagline: "Build intelligent data workflows in minutes — no code required."
- Three entry options as large cards: **Start from Template**, **Describe with AI**, **Build Manually**
- Clicking any option navigates to `/builder` with the appropriate mode pre-selected

### Page 2: Workflow Builder (`/builder`)
**Layout:** Three-panel layout

- **Left panel (Node Palette):** Draggable node type cards grouped into sections: "Input Nodes", "Logic Nodes", "Action Nodes". Each card shows an icon + name.
- **Center panel (Canvas):** React Flow canvas. Drop nodes here, connect with edges. Mini-map bottom-right. Zoom controls visible.
- **Right panel (Config + Output):**
  - Top half: selected node configuration panel (name + mock config fields)
  - Bottom half: execution output panel — logs and results after "Run Workflow"

**Top bar:** Logo left → workflow name (editable inline) center → "Export JSON", "AI Generate", "Run Workflow" buttons right

**AI Generate modal:** Floating modal with textarea. User types natural language. "Generate" calls backend, canvas auto-populates with returned nodes+edges.

**Templates strip:** Collapsible horizontal bar below top bar showing 3 template cards. Clicking one loads it onto the canvas.

---

## 5. UI & DESIGN INSTRUCTIONS

**Aesthetic:** Dark, technical, data-forward. Mission control for data pipelines. Inspired by Vercel + Linear — near-black backgrounds, sharp contrast, subtle glows.

**Color scheme (use as CSS variables):**
```css
--bg-base: #0a0a0f;
--bg-panel: #111118;
--border: #1e1e2e;
--accent: #6366f1;
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--text-primary: #f8fafc;
--text-muted: #64748b;
```

**Typography:**
- Headings: `'Space Mono'` (Google Fonts) — terminal/data aesthetic
- Body: `'DM Sans'` (Google Fonts) — clean and readable
- Import both in `index.html`

**Node card design:**
- `rounded-xl`, background `#1a1a2e`, left border 3px colored by node type:
  - Input → indigo (`#6366f1`)
  - Logic → amber (`#f59e0b`)
  - Action → green (`#22c55e`)
- Show icon + type label + node name
- During execution: apply `nodeGlow` CSS keyframe animation (pulsing box-shadow in accent color)

**Canvas:** React Flow dark theme, `<Background variant="dots">`, dotted grid

**Buttons:**
- Rounded, subtle glow on hover via `box-shadow` with accent color
- "Run Workflow" button: green, slightly pulses with CSS animation

**Animations:**
- `nodeGlow` keyframe: pulses `box-shadow` with indigo for executing nodes, 0.8s duration
- 600ms delay between each node highlight during execution
- Fade-in on output panel results
- Slide-in for AI Generate modal

**Layout rules:**
- Full viewport height, no page scroll
- Panels scroll internally if content overflows
- Canvas fills `calc(100vh - topBarHeight)`
- Empty canvas state: centered dashed-border message "Drag nodes here to start building your workflow" shown when `nodes.length === 0`

---

## 6. DATA & APIS

### Mock Data (hardcode in `server.js`)

```js
const MOCK_FAILED_TABLES = [
  { table: "orders_v2", database: "ecommerce", status: "failed", last_run: "2024-01-15", error: "Null values in required column" },
  { table: "user_events", database: "analytics", status: "failed", last_run: "2024-01-15", error: "Schema mismatch detected" },
  { table: "payment_logs", database: "finance", status: "failed", last_run: "2024-01-14", error: "Row count anomaly" }
];

const MOCK_PII_DATA = [
  { table: "customers", column: "email", tag: "PII", owner: "data-team@company.com" },
  { table: "users", column: "phone_number", tag: "PII", owner: "data-team@company.com" },
  { table: "orders", column: "shipping_address", tag: "PII", owner: "ops-team@company.com" },
  { table: "payments", column: "card_last_four", tag: "PII_SENSITIVE", owner: "security@company.com" }
];
```

### Express API Endpoints

**`GET /api/health`** → `{ status: "ok" }`

**`GET /api/templates`** → returns array of 3 template objects, each with `id`, `name`, `description`, `nodes`, `edges`

**Template 1 — Data Failure Alert:** fetch_failed_tables → filter(failed) → send_notification

**Template 2 — PII Monitoring:** fetch_pii_data → filter(PII) → generate_report → send_notification

**Template 3 — Weekly Data Summary:** fetch_failed_tables → fetch_pii_data → generate_report

**`POST /api/execute`**
- Request: `{ nodes: [...], edges: [...] }`
- Build adjacency map from edges. Walk nodes source→target. For each node execute:
  - `fetch_failed_tables` → return `MOCK_FAILED_TABLES`
  - `fetch_pii_data` → return `MOCK_PII_DATA`
  - `filter` → filter previous node's output by `tag === "PII"` or `status === "failed"`
  - `send_notification` → push log: `"✅ Slack notification sent to #data-alerts: [N] records flagged"`
  - `generate_report` → return formatted summary string of input data
- Response: `{ logs: [...], results: {...}, steps: [{ nodeId, status, output }] }`

**`POST /api/ai-generate`**
- Request: `{ prompt: "Notify me when PII data fails" }`
- Read `GEMINI_API_KEY` from `process.env`. If missing, return a hardcoded mock workflow.
- Call Gemini with this exact system prompt:

```
You are a workflow generator for MetaFlow AI. Given a user's natural language description, generate a React Flow compatible workflow JSON.

Available node types:
- fetch_failed_tables (type: input)
- fetch_pii_data (type: input)
- filter (type: logic, config: { filterBy: "PII" or "failed" })
- send_notification (type: action, config: { channel: "#data-alerts" })
- generate_report (type: action)

Return ONLY a valid JSON object (no markdown, no explanation, no backticks) with this exact structure:
{
  "nodes": [
    { "id": "1", "type": "customNode", "position": { "x": 100, "y": 200 }, "data": { "nodeType": "fetch_failed_tables", "label": "Fetch Failed Tables" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}

Space nodes horizontally: x increases by 250 per step. Keep y at 200.
```

- Strip any markdown fences from Gemini response, parse JSON, return `{ nodes, edges }`

---

## 7. STEP-BY-STEP BUILD INSTRUCTIONS

Follow these steps in exact order. Do not skip any step.

**STEP 1: Project structure**
Create a monorepo with two folders: `frontend/` (React Vite app) and `backend/` (Node.js Express app). Structure:
```
metaflow-ai/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomNode.jsx
│   │   │   ├── NodePalette.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   └── AIModal.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   └── Builder.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── start.sh
```

**STEP 2: Backend — `backend/server.js`**
- `require('dotenv').config()`
- Import `express`, `cors`, `@google/generative-ai`
- Hardcode `MOCK_FAILED_TABLES` and `MOCK_PII_DATA` arrays at top
- Apply `express.json()` and `cors()` middleware
- Implement all 4 routes as described in Section 6
- For `/api/execute`: build adjacency map, execute nodes in order, accumulate steps/logs/results, return full trace
- For `/api/ai-generate`: call Gemini if key available, else return mock; strip markdown fences before `JSON.parse`
- `app.listen(5000)`
- Add to `backend/package.json`: `"start": "node server.js"`

**STEP 3: Frontend base setup**
- Create Vite React app in `frontend/`
- Install all frontend dependencies
- Configure Tailwind: `npx tailwindcss init -p`, set content paths, enable dark mode via class
- In `frontend/index.html` add Google Fonts import for Space Mono and DM Sans
- In `frontend/src/index.css` set: `body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #f8fafc; }`
- Define all CSS variables from Section 5 on `:root`

**STEP 4: Vite proxy**
In `frontend/vite.config.js`:
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

**STEP 5: `CustomNode.jsx`**
- Accept `data` prop containing `nodeType`, `label`, `executing` (boolean)
- Map nodeType to: border color (indigo/amber/green), icon from lucide-react (Database for fetch nodes, Filter for filter, Bell for notification, FileText for report)
- Render: card div with left colored border, icon, label
- When `executing === true`: apply `nodeGlow` CSS animation class
- Include React Flow `<Handle type="target" position={Position.Left}>` and `<Handle type="source" position={Position.Right}>`

**STEP 6: `NodePalette.jsx`**
- Define node type list with categories: Input (fetch_failed_tables, fetch_pii_data), Logic (filter), Action (send_notification, generate_report)
- Each item: `draggable`, `onDragStart` sets `event.dataTransfer.setData('nodeType', type)`
- Styled as dark sidebar panel with category headers in muted text

**STEP 7: `Builder.jsx` — Canvas setup**
- Import `ReactFlow`, `useNodesState`, `useEdgesState`, `ReactFlowProvider`, `Background`, `MiniMap`, `Controls` from `reactflow`
- Import `ReactFlow` CSS: `import 'reactflow/dist/style.css'`
- Register `CustomNode` in `nodeTypes = { customNode: CustomNode }`
- Wrap everything in `<ReactFlowProvider>`
- State: `nodes`, `edges`, `reactFlowInstance`, `selectedNode`, `executionLogs`, `executionResults`, `isExecuting`
- Implement `onDrop`: read nodeType from dataTransfer, create node at `reactFlowInstance.screenToFlowPosition(e.clientX, e.clientY)`, add to nodes
- Implement `onDragOver`: `e.preventDefault()`
- Implement `onConnect`: add edge using `addEdge`
- Use `<Background variant="dots" color="#1e1e2e">` and `<MiniMap>` and `<Controls>`
- Empty state: show centered dashed-border message when `nodes.length === 0`

**STEP 8: Top bar in `Builder.jsx`**
- Left: lightning bolt icon + "MetaFlow AI" in Space Mono
- Center: editable workflow name input (inline, styled as plain text)
- Right: three buttons
  - "Export JSON": `JSON.stringify({nodes, edges}, null, 2)` → download as `.json` file via blob URL
  - "AI Generate": set `showAIModal = true`
  - "Run Workflow": calls `handleRunWorkflow()`, styled green with pulse animation

**STEP 9: Workflow execution in `Builder.jsx`**
- `handleRunWorkflow`: POST `{ nodes, edges }` to `/api/execute`
- On response: iterate `steps` array with `for` loop + `await new Promise(resolve => setTimeout(resolve, 600))` between steps
- For each step: update that node's data to `{ ...data, executing: true }` via `setNodes`, wait 600ms, then set `executing: false` and set color to success/error
- After all steps: set `executionLogs` and `executionResults` state to display in output panel

**STEP 10: `OutputPanel.jsx`**
- Props: `logs`, `results`
- Scrollable dark panel, Space Mono font for logs
- Each log entry: timestamp + status icon (✅/❌) + message text
- Results section below: formatted JSON or summary of final output data
- Fade-in animation on mount using CSS

**STEP 11: `AIModal.jsx`**
- Props: `isOpen`, `onClose`, `onGenerate`
- Centered modal overlay, dark background, rounded border
- Textarea: placeholder "Describe your workflow... e.g. Notify me when PII data fails"
- "Generate Workflow" button: POST prompt to `/api/ai-generate`, on success call `onGenerate(nodes, edges)` and close modal
- Loading spinner state while awaiting response
- Error message display if request fails
- Slide-in CSS animation on open

**STEP 12: Templates strip in `Builder.jsx`**
- On component mount: GET `/api/templates`, store in state
- Render horizontal strip below top bar: 3 cards showing template name + description
- Clicking a card: `setNodes(template.nodes)` and `setEdges(template.edges)`
- Strip is collapsible via a toggle chevron button

**STEP 13: `Landing.jsx`**
- Full-screen dark page, vertically and horizontally centered content
- "MetaFlow AI" heading in Space Mono, large, with CSS text gradient from indigo to purple (`background-clip: text`)
- Tagline below in muted color
- Three cards side by side with icon, title, one-line description
- Cards: slight border, hover lifts with `transform: translateY(-4px)` and glow
- Each card uses `useNavigate()` from react-router-dom to go to `/builder`

**STEP 14: Routing in `App.jsx`**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Builder from './pages/Builder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**STEP 15: CSS animations**
Add to `index.css`:
```css
@keyframes nodeGlow {
  0%, 100% { box-shadow: 0 0 6px #6366f1; }
  50% { box-shadow: 0 0 20px #6366f1, 0 0 40px #6366f180; }
}
.node-executing { animation: nodeGlow 0.8s ease-in-out infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.btn-run { animation: pulse 2s ease-in-out infinite; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeIn 0.3s ease forwards; }

@keyframes slideIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.slide-in { animation: slideIn 0.2s ease forwards; }
```

**STEP 16: Environment and startup**
- Create `backend/.env` with `GEMINI_API_KEY=your_key_here`
- Add `GEMINI_API_KEY` as a Replit Secret
- Create root `start.sh`:
```bash
#!/bin/bash
cd backend && node server.js &
cd frontend && npm run dev
```
- Or install `concurrently` at root and add to root `package.json`:
```json
"scripts": {
  "dev": "concurrently \"cd backend && node server.js\" \"cd frontend && npm run dev\""
}
```
- Configure `.replit` to run `npm run dev` at root level

**STEP 17: Final checks before demo**
- Verify drag-and-drop works: drag a node from palette, drop on canvas, see it rendered
- Verify connection: drag from one node's right handle to another node's left handle
- Verify execution: click Run Workflow, watch nodes glow one by one, see output panel fill up
- Verify AI Generate: type "Alert me when PII tables fail", click Generate, canvas populates
- Verify templates: click a template card, canvas loads pre-built workflow
- Verify export: click Export JSON, a `.json` file downloads with correct structure
- Ensure no console errors on page load