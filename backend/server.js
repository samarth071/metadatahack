// METADATAHACK/backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock OpenMetadata Data
const mockDatabase = {
    tables: [
        { id: 1, name: 'users', tags: ['PII'], status: 'healthy' },
        { id: 2, name: 'transactions', tags: ['financial'], status: 'failed' },
        { id: 3, name: 'logs', tags: [], status: 'healthy' },
        { id: 4, name: 'emails', tags: ['PII'], status: 'failed' }
    ]
};

app.post('/api/execute', (req, res) => {
    const { nodes, edges } = req.body;
    let logs = [];
    let currentPayload = null;

    if (!nodes || nodes.length === 0) {
        return res.json({ logs: ["Execution failed: No workflow nodes found."] });
    }

    // Find starting node (no incoming edges)
    const targetNodeIds = new Set(edges.map(e => e.target));
    let currentNode = nodes.find(n => !targetNodeIds.has(n.id));

    if (!currentNode) {
         return res.json({ logs: ["Execution failed: Could not find a valid starting node."] });
    }

    logs.push(`🚀 Starting workflow execution...`);

    // Execute sequentially
    while (currentNode) {
        logs.push(`⏳ Executing Node [${currentNode.data.label}]...`);

        switch (currentNode.data.task) {
            case 'fetch_failed':
                currentPayload = mockDatabase.tables.filter(t => t.status === 'failed');
                logs.push(`✅ Fetched ${currentPayload.length} failed tables.`);
                break;
            case 'fetch_pii':
                currentPayload = mockDatabase.tables.filter(t => t.tags.includes('PII'));
                logs.push(`✅ Fetched ${currentPayload.length} tables containing PII.`);
                break;
            case 'filter_pii':
                if (currentPayload) {
                    currentPayload = currentPayload.filter(t => t.tags.includes('PII'));
                    logs.push(`✅ Filtered dataset down to ${currentPayload.length} PII records.`);
                } else {
                    logs.push(`❌ Filter failed: No input data received.`);
                }
                break;
            case 'send_slack':
                logs.push(`🔔 [SLACK NOTIFICATION] Triggered alert for payload: ${JSON.stringify(currentPayload)}`);
                break;
            case 'generate_report':
                logs.push(`📊 Generated Report based on ${currentPayload ? currentPayload.length : 0} items.`);
                break;
            default:
                logs.push(`⚠️ Unknown task: ${currentNode.data.task}`);
        }

        // Find next node
        const outgoingEdge = edges.find(e => e.source === currentNode.id);
        currentNode = outgoingEdge ? nodes.find(n => n.id === outgoingEdge.target) : null;
    }

    logs.push(`🏁 Workflow execution completed.`);
    res.json({ logs, finalResult: currentPayload });
});

app.listen(PORT, () => {
    console.log(`MetaFlow AI Backend running on http://localhost:${PORT}`);
});