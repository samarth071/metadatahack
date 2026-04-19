import React from 'react';
import { Database, Filter, Bell, FileText, ChevronRight } from 'lucide-react';

const nodeTypes = [
  {
    category: 'Input Nodes',
    items: [
      { type: 'fetch_failed_tables', label: 'Fetch Failed Tables', icon: Database, color: 'text-accent' },
      { type: 'fetch_pii_data', label: 'Fetch PII Data', icon: Database, color: 'text-accent' },
    ]
  },
  {
    category: 'Logic Nodes',
    items: [
      { type: 'filter', label: 'Filter by Tag', icon: Filter, color: 'text-secondary' },
    ]
  },
  {
    category: 'Action Nodes',
    items: [
      { type: 'send_notification', label: 'Send Alert', icon: Bell, color: 'text-tertiary' },
      { type: 'generate_report', label: 'Generate Report', icon: FileText, color: 'text-tertiary' },
    ]
  }
];

const NodePalette = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('nodeType', nodeType);
    event.dataTransfer.setData('label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 bg-[#0e0e13] border-r border-white/5 h-full overflow-y-auto p-6 transition-all duration-300">
      <h2 className="text-[10px] font-bold font-terminal uppercase tracking-[0.25em] text-accent mb-10 px-2 opacity-80">
        Mission Console / Palette
      </h2>

      {nodeTypes.map((category, idx) => (
        <div key={idx} className="mb-10 last:mb-0">
          <h3 className="text-[10px] font-bold font-terminal uppercase tracking-widest text-[#c7c4d7]/40 mb-5 px-2">
            {category.category}
          </h3>
          <div className="space-y-4">
            {category.items.map((node, nIdx) => (
              <div
                key={nIdx}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] cursor-grab active:cursor-grabbing transition-all group relative overflow-hidden"
                onDragStart={(event) => onDragStart(event, node.type, node.label)}
                draggable
              >
                {/* Subtle highlight gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className={`p-2.5 rounded-lg bg-[#0e0e13] ${node.color} shadow-lg shadow-black/20`}>
                  <node.icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 relative z-10">
                  <div className="text-xs font-bold text-[#e4e1e9] font-sans group-hover:text-accent transition-colors">
                    {node.label}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-16 p-5 rounded-2xl bg-[#131318]/80 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent/20"></div>
        <p className="text-[10px] leading-relaxed text-[#c7c4d7]/60 font-terminal uppercase tracking-wider">
          System Protocol: Drag entities to initialize data workflow streams.
        </p>
      </div>
    </div>
  );
};

export default NodePalette;
