import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Play, 
  Download, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Zap,
  MousePointer2
} from 'lucide-react';

import NodePalette from '../components/NodePalette';
import CustomNode from '../components/CustomNode';
import OutputPanel from '../components/OutputPanel';
import AIModal from '../components/AIModal';

const nodeTypes = {
  customNode: CustomNode,
};

const Builder = () => {
  const location = useLocation();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Initialize from URL params (Landing page choices)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    
    if (mode === 'template') {
      setShowTemplates(true);
      fetchTemplates();
    } else if (mode === 'ai') {
      setIsAIModalOpen(true);
    }
  }, [location]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error("Failed to fetch templates");
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } 
    }, eds));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('nodeType');
      const label = event.dataTransfer.getData('label');

      if (!type) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'customNode',
        position,
        data: { nodeType: type, label, executing: false },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance]
  );

  const runWorkflow = async () => {
    if (nodes.length === 0) return;
    
    setIsExecuting(true);
    setLogs([]);
    setResults(null);
    
    try {
      const response = await axios.post('/api/execute', { nodes, edges });
      const { logs: execLogs, results: execResults, steps } = response.data;
      
      // Animation sequence
      for (const step of steps) {
        // Highlight current node
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: { ...node.data, executing: node.id === step.nodeId },
          }))
        );
        
        // Wait 600ms
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      
      // Clear highlights
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, executing: false },
        }))
      );
      
      setLogs(execLogs);
      setResults(execResults);
    } catch (error) {
      setLogs([{ 
        timestamp: new Date().toISOString(), 
        status: 'error', 
        message: error.response?.data?.error || error.response?.data?.message || error.message || 'Workflow execution failed.' 
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExport = () => {
    const workflow = { name: workflowName, nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const loadTemplate = (template) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-slate-200">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#1e1e2e] flex items-center justify-between px-6 bg-[#111118]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm font-bold font-mono tracking-tight text-white w-48"
            />
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 uppercase tracking-wider">
              Draft / v1.0.4 <ChevronRight className="w-2 h-2" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${showTemplates ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'border-[#1e1e2e] hover:border-slate-700 text-slate-400'}`}
          >
            <Layers className="w-4 h-4" /> Templates
          </button>
          
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2 bg-[#1a1a2e] border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-500/10 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> AI Generate
          </button>

          <div className="h-6 w-[1px] bg-[#1e1e2e] mx-2"></div>

          <button 
            onClick={handleExport}
            className="p-2 border border-[#1e1e2e] text-slate-400 rounded-lg hover:bg-[#1a1a2e] transition-all"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button 
            onClick={runWorkflow}
            disabled={isExecuting || nodes.length === 0}
            className={`px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 ${!isExecuting ? 'btn-run' : ''}`}
          >
            {isExecuting ? <Zap className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
            {isExecuting ? 'Executing...' : 'Run Workflow'}
          </button>
        </div>
      </div>

      {/* Template Strip */}
      {showTemplates && (
        <div className="h-48 border-b border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4 overflow-x-auto slide-in">
          {templates.length === 0 ? (
            <div className="flex items-center justify-center w-full text-slate-500 text-xs font-mono italic">
              Loading templates...
            </div>
          ) : (
            templates.map(t => (
              <div 
                key={t.id}
                onClick={() => loadTemplate(t)}
                className="min-w-[280px] p-5 rounded-2xl bg-[#1a1a2e] border border-[#1e1e2e] hover:border-indigo-500/50 cursor-pointer transition-all group"
              >
                <h4 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {t.name}
                </h4>
                <p className="text-xs text-slate-500 mb-4 whitespace-normal leading-relaxed">
                  {t.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase">
                    {t.nodes.length} Nodes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarOpen ? <NodePalette /> : null}
        
        {/* Handle toggle sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-4 h-12 bg-[#111118] border border-[#1e1e2e] flex items-center justify-center z-20 rounded-r-lg group hover:bg-indigo-600 transition-colors"
          style={{ left: isSidebarOpen ? '288px' : '0' }}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3 group-hover:text-white" /> : <ChevronRight className="w-3 h-3 group-hover:text-white" />}
        </button>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0a0a0f]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant="dots" color="#1e1e2e" gap={20} />
            <Controls position="bottom-left" />
            <MiniMap 
              zoomable 
              pannable 
              style={{ backgroundColor: '#111118', border: '1px solid #1e1e2e' }} 
              maskColor="rgba(0,0,0,0.3)"
            />
            
            <Panel position="top-right">
              {nodes.length > 0 && (
                <button 
                  onClick={() => { setNodes([]); setEdges([]); setLogs([]); setResults(null); }}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </Panel>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-12 border-2 border-dashed border-[#1e1e2e] rounded-[40px] opacity-40">
                  <MousePointer2 className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                  <p className="text-lg font-bold text-slate-500 uppercase tracking-widest leading-loose">
                    Drag nodes here<br/>to start building
                  </p>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        {/* Right Sidebar - Output Panel */}
        <div className="w-96 flex-shrink-0">
          <OutputPanel logs={logs} results={results} />
        </div>
      </div>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onGenerate={(newNodes, newEdges) => {
          setNodes(newNodes);
          setEdges(newEdges.map(e => ({ ...e, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } })));
          setWorkflowName('AI Generated Workflow');
        }}
      />
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <Builder />
  </ReactFlowProvider>
);
