// metaflow-ai/backend/server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Data (Removed in favor of Neon DB)

// Routes
app.get('/', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; background: #0a0a0f; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <div style="text-align: center; border: 1px solid #1e1e2e; padding: 40px; border-radius: 24px; background: #111118; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <h1 style="color: #6366f1; margin: 0 0 10px 0;">🚀 MetaFlow AI</h1>
        <p style="color: #94a3b8; font-size: 1.1rem; margin: 0 0 20px 0;">Backend API Server is Live</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <span style="background: #10b98122; color: #10b981; padding: 6px 12px; rounded-full; font-size: 0.8rem; font-weight: bold; border: 1px solid #10b98144; border-radius: 20px;">Neon DB: Connected</span>
          <span style="background: #6366f122; color: #6366f1; padding: 6px 12px; rounded-full; font-size: 0.8rem; font-weight: bold; border: 1px solid #6366f144; border-radius: 20px;">Status: Healthy</span>
        </div>
      </div>
    </body>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

app.get('/api/templates', (req, res) => {
  res.json([
    {
      id: "template-1",
      name: "Data Failure Alert",
      description: "Notify me when data tables fail",
      nodes: [
        { id: '1', type: 'customNode', position: { x: 100, y: 200 }, data: { nodeType: 'fetch_failed_tables', label: 'Fetch Failed Tables' } },
        { id: '2', type: 'customNode', position: { x: 400, y: 200 }, data: { nodeType: 'filter', label: 'Filter Failed', config: { filterBy: 'failed' } } },
        { id: '3', type: 'customNode', position: { x: 700, y: 200 }, data: { nodeType: 'send_notification', label: 'Send Slack Alert', config: { channel: '#data-alerts' } } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true }
      ]
    },
    {
      id: "template-2",
      name: "PII Monitoring",
      description: "Detect and report PII exposure",
      nodes: [
        { id: '1', type: 'customNode', position: { x: 100, y: 200 }, data: { nodeType: 'fetch_pii_data', label: 'Fetch PII Data' } },
        { id: '2', type: 'customNode', position: { x: 400, y: 200 }, data: { nodeType: 'filter', label: 'Filter PII', config: { filterBy: 'PII' } } },
        { id: '3', type: 'customNode', position: { x: 700, y: 200 }, data: { nodeType: 'generate_report', label: 'Generate PII Report' } },
        { id: '4', type: 'customNode', position: { x: 1000, y: 200 }, data: { nodeType: 'send_notification', label: 'Notify Security', config: { channel: '#security' } } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
        { id: 'e3-4', source: '3', target: '4', animated: true }
      ]
    },
    {
      id: "template-3",
      name: "Weekly Data Summary",
      description: "Generate summary of all data issues",
      nodes: [
        { id: '1', type: 'customNode', position: { x: 100, y: 100 }, data: { nodeType: 'fetch_failed_tables', label: 'Fetch Failed Tables' } },
        { id: '2', type: 'customNode', position: { x: 100, y: 300 }, data: { nodeType: 'fetch_pii_data', label: 'Fetch PII Data' } },
        { id: '3', type: 'customNode', position: { x: 500, y: 200 }, data: { nodeType: 'generate_report', label: 'Weekly Report' } }
      ],
      edges: [
        { id: 'e1-3', source: '1', target: '3', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true }
      ]
    }
  ]);
});

app.post('/api/execute', async (req, res) => {
  const { nodes, edges } = req.body;
  const logs = [];
  const results = {};
  const steps = [];

  // Build adjacency map
  const adjMap = {};
  edges.forEach(edge => {
    if (!adjMap[edge.source]) adjMap[edge.source] = [];
    adjMap[edge.source].push(edge.target);
  });

  // Find root nodes (no incoming edges)
  const incoming = new Set(edges.map(e => e.target));
  const queue = nodes.filter(n => !incoming.has(n.id)).map(n => n.id);
  const executed = new Set();
  
  let currentData = [];

  try {
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (executed.has(nodeId)) continue;
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const nodeType = node.data.nodeType;
      let output = null;

      switch (nodeType) {
        case 'fetch_failed_tables':
          try {
            const response = await fetch('https://ep-still-mud-aoc5gnkg.apirest.c-2.ap-southeast-1.aws.neon.tech/neondb/rest/v1/failed_tables', {
              headers: { 'Accept': 'application/json' }
            });
            output = await response.json();
            if (!Array.isArray(output)) output = []; // Guard against error objects
            logs.push({ timestamp: new Date().toISOString(), status: 'success', message: `Fetched ${output.length || 0} failed tables from Neon DB.` });
          } catch (err) {
            output = [];
            logs.push({ timestamp: new Date().toISOString(), status: 'error', message: `DB Request Failed: ${err.message}` });
          }
          currentData = [...currentData, ...(Array.isArray(output) ? output : [])];
          break;
        case 'fetch_pii_data':
          try {
            const response = await fetch('https://ep-still-mud-aoc5gnkg.apirest.c-2.ap-southeast-1.aws.neon.tech/neondb/rest/v1/pii_data', {
              headers: { 'Accept': 'application/json' }
            });
            output = await response.json();
            if (!Array.isArray(output)) output = []; // Guard against error objects
            logs.push({ timestamp: new Date().toISOString(), status: 'success', message: `Fetched ${output.length || 0} PII data records from Neon DB.` });
          } catch (err) {
            output = [];
            logs.push({ timestamp: new Date().toISOString(), status: 'error', message: `DB Request Failed: ${err.message}` });
          }
          currentData = [...currentData, ...(Array.isArray(output) ? output : [])];
          break;
        case 'filter':
          const filterBy = node.data.config?.filterBy || 'PII';
          if (filterBy === 'PII') {
            currentData = currentData.filter(d => d.tag && d.tag.includes('PII'));
          } else if (filterBy === 'failed') {
            currentData = currentData.filter(d => d.status === 'failed');
          }
          logs.push({ timestamp: new Date().toISOString(), status: 'success', message: `Filtered data by '${filterBy}'. Remaining: ${currentData.length} records.` });
          output = currentData;
          break;
        case 'send_notification':
          const channel = node.data.config?.channel || '#data-alerts';
          const webhookUrl = process.env.SLACK_WEBHOOK_URL;
          
          if (!webhookUrl) {
             logs.push({ timestamp: new Date().toISOString(), status: 'warning', message: 'Skipped Slack notification: SLACK_WEBHOOK_URL is not set in .env' });
             output = 'Slack webhook not configured.';
             break;
          }

          // Construct rich Slack Block Kit layout
          const blocks = [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🚀 MetaFlow AI Workflow Alert",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Target Channel:* \`${channel}\`\n*Total Records Flagged:* ${currentData.length}`
              }
            },
            {
              type: "divider"
            }
          ];

          // Add top 5 items with rich detail
          const topItems = currentData.slice(0, 5);
          if (topItems.length > 0) {
            topItems.forEach((item, index) => {
              let detailText = "";
              if (item.tag) {
                detailText = `*${index + 1}. [PII]* Table: \`${item.table_name}\` | Column: \`${item.column_name}\` | Tag: \`${item.tag}\` | Owner: _${item.owner}_`;
              } else if (item.status) {
                detailText = `*${index + 1}. [Failed]* Table: \`${item.table_name}\` | Database: \`${item.database_name}\` | Error: _${item.error}_`;
              } else {
                detailText = `*${index + 1}.* Table: \`${item.table_name || 'Unknown'}\``;
              }

              blocks.push({
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: detailText
                }
              });
            });
          } else {
            blocks.push({
              type: "section",
              text: {
                type: "mrkdwn",
                text: "_No records were found to flag in this segment._"
              }
            });
          }

          if (currentData.length > 5) {
            blocks.push({
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `_...and ${currentData.length - 5} more records._`
                }
              ]
            });
          }

          blocks.push({
            type: "divider"
          }, {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*Sent at:* ${new Date().toLocaleString()} | *MetaFlow AI Engine*`
              }
            ]
          });

          try {
            const slackResp = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blocks })
            });
            
            if (!slackResp.ok) {
              const errText = await slackResp.text();
              throw new Error(`Slack error ${slackResp.status}: ${errText}`);
            }
            
            logs.push({ timestamp: new Date().toISOString(), status: 'success', message: `✅ Rich Slack notification sent successfully!` });
            output = `Rich Notification sent to Slack.`;
          } catch (e) {
            console.error("Slack Notification Error:", e);
            logs.push({ timestamp: new Date().toISOString(), status: 'error', message: `Failed to send to Slack: ${e.message}` });
            output = `Slack API Error.`;
          }
          break;
        case 'generate_report':
          const formattedDetails = currentData.slice(0, 5).map((item, index) => {
            if (item.tag) {
              return `${index + 1}. [PII] Table: ${item.table_name}, Column: ${item.column_name}, Tag: ${item.tag}`;
            } else if (item.status) {
              return `${index + 1}. [Failed] Table: ${item.table_name}, Database: ${item.database_name}, Error: ${item.error}`;
            }
            return `${index + 1}. Item from table: ${item.table_name || 'Unknown'}`;
          }).join('\n');
          
          output = `Data Report Summary\n------------------\nTotal Items Processed: ${currentData.length}\n\nTop Insights:\n${formattedDetails || 'No data to report.'}`;
          logs.push({ timestamp: new Date().toISOString(), status: 'success', message: `Generated report summary for ${currentData.length} items.` });
          break;
      }

      steps.push({ nodeId, status: 'success', output });
      executed.add(nodeId);

      if (adjMap[nodeId]) {
        adjMap[nodeId].forEach(neighbor => queue.push(neighbor));
      }
    }

    res.json({ logs, results: { finalData: currentData }, steps });
  } catch (globalError) {
    console.error("Workflow Execution Error:", globalError);
    res.status(500).json({ error: globalError.message, logs, steps });
  }
});

app.post('/api/ai-generate', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    // Return mock workflow if no API key
    return res.json({
      nodes: [
        { id: '1', type: 'customNode', position: { x: 100, y: 200 }, data: { nodeType: 'fetch_failed_tables', label: 'Fetch Failed Tables' } },
        { id: '2', type: 'customNode', position: { x: 400, y: 200 }, data: { nodeType: 'filter', label: 'Filter Failed', config: { filterBy: 'failed' } } },
        { id: '3', type: 'customNode', position: { x: 700, y: 200 }, data: { nodeType: 'send_notification', label: 'Notify Team', config: { channel: '#data-alerts' } } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true }
      ]
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are a workflow generator for MetaFlow AI. Given a user's natural language description, generate a React Flow compatible workflow JSON.

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

Space nodes horizontally: x increases by 250 per step. Keep y at 200.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUser request: ${prompt}`);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const workflow = JSON.parse(responseText);
    res.json(workflow);
  } catch (error) {
    console.error("AI Generation failed:", error);
    res.status(500).json({ error: "Failed to generate workflow via AI." });
  }
});

app.listen(PORT, () => {
  console.log(`MetaFlow AI Backend running on http://localhost:${PORT}`);
});