import React from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Filter, Bell, FileText, Activity } from 'lucide-react';

const CustomNode = ({ data }) => {
  const isExecuting = data.executing;
  
  const getIcon = (type) => {
    switch (type) {
      case 'fetch_failed_tables':
      case 'fetch_pii_data':
        return <Database className="w-5 h-5 text-accent" />;
      case 'filter':
        return <Filter className="w-5 h-5 text-secondary" />;
      case 'send_notification':
        return <Bell className="w-5 h-5 text-tertiary" />;
      case 'generate_report':
        return <FileText className="w-5 h-5 text-tertiary" />;
      default:
        return <Activity className="w-5 h-5 text-outline" />;
    }
  };

  const getGlowColor = (type) => {
    if (type.startsWith('fetch')) return 'rgba(192, 193, 255, 0.4)'; // accent
    if (type === 'filter') return 'rgba(255, 185, 95, 0.4)'; // secondary
    if (type === 'send_notification' || type === 'generate_report') return 'rgba(74, 225, 118, 0.4)'; // tertiary
    return 'rgba(144, 143, 160, 0.4)';
  };

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-2xl transition-all duration-300 min-w-[200px] ${isExecuting ? 'node-executing' : ''}`}
      style={{ 
        boxShadow: isExecuting ? `0 0 25px ${getGlowColor(data.nodeType)}` : 'none',
        background: '#2a292f' // surface-container-high
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent" />
      
      {/* Node Header - surface-container-highest */}
      <div className="bg-[#35343a] px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="text-[10px] uppercase tracking-[0.1em] text-accent font-terminal font-bold">
          {data.nodeType.replace(/_/g, ' ')}
        </div>
        {getIcon(data.nodeType)}
      </div>

      {/* Node Body */}
      <div className="px-4 py-4 bg-[#2a292f]">
        <div className="text-sm font-bold text-[#e4e1e9] font-sans">
          {data.label}
        </div>
        <div className="mt-1 text-[10px] text-[#c7c4d7]/60 font-terminal uppercase tracking-wider">
          Node_ID: {Math.random().toString(36).substr(2, 6)}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-accent" />
    </div>
  );
};

export default CustomNode;
