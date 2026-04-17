// METADATAHACK/frontend/src/Sidebar.jsx
import React from 'react';
import { Database, Filter, Bell, FileText } from 'lucide-react';

const nodeTypes = [
  { type: 'input', task: 'fetch_failed', label: 'Fetch Failed Tables', icon: <Database size={16} /> },
  { type: 'input', task: 'fetch_pii', label: 'Fetch PII Data', icon: <Database size={16} /> },
  { type: 'default', task: 'filter_pii', label: 'Filter (Tag == PII)', icon: <Filter size={16} /> },
  { type: 'output', task: 'send_slack', label: 'Send Slack Notify', icon: <Bell size={16} /> },
  { type: 'output', task: 'generate_report', label: 'Generate Report', icon: <FileText size={16} /> }
];

export default function Sidebar() {
  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar">
      <h3>Nodes</h3>
      {nodeTypes.map((node) => (
        <div
          key={node.task}
          className="dnd-node"
          onDragStart={(event) => onDragStart(event, node)}
          draggable
        >
          {node.icon}
          {node.label}
        </div>
      ))}
    </div>
  );
}