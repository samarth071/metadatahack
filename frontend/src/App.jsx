// METADATAHACK/frontend/src/App.jsx
import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import Sidebar from './Sidebar';
import './App.css';

const initialNodes = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

export default function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [logs, setLogs] = useState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeDataStr = event.dataTransfer.getData('application/reactflow');

      if (!nodeDataStr) return;
      const nodeData = JSON.parse(nodeDataStr);

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type: nodeData.type,
        position,
        data: { label: nodeData.label, task: nodeData.task },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const runWorkflow = async () => {
    setLogs(['Connecting to execution engine...']);
    try {
      const response = await axios.post('http://localhost:3001/api/execute', {
        nodes,
        edges,
      });
      setLogs(response.data.logs);
    } catch (error) {
      setLogs(['Error connecting to backend.', error.message]);
    }
  };

  return (
    <div className="layout-container">
      <div className="header">
        <h2>🧩 MetaFlow AI</h2>
        <button className="run-btn" onClick={runWorkflow}>▶ Run Workflow</button>
      </div>
      
      <div className="main-area">
        <Sidebar />
        
        <div className="flow-container" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
            >
              <Controls />
              <Background color="#ccc" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <div className="output-panel">
          <h3>🧾 Output Logs</h3>
          <hr style={{borderColor: '#334155'}}/>
          {logs.map((log, i) => (
            <div key={i} style={{marginBottom: '10px'}}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}