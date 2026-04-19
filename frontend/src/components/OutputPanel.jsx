import React from 'react';
import { Terminal, CheckCircle2, XCircle, Clock } from 'lucide-react';

const OutputPanel = ({ logs, results }) => {
  return (
    <div className="h-full flex flex-col bg-[#111118] border-l border-[#1e1e2e]">
      <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Terminal className="w-4 h-4" /> Execution Logs
        </h2>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-[10px] uppercase tracking-widest">Awaiting execution...</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="fade-in bg-[#1a1a2e]/50 p-3 rounded-lg border border-[#1e1e2e] text-[11px] leading-relaxed">
              <div className="flex items-start gap-3">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={log.status === 'error' ? 'text-red-400' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-1/2 border-t border-[#1e1e2e] flex flex-col">
        <div className="p-4 border-b border-[#1e1e2e]">
          <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500">
            Final Results
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {results ? (
            <pre className="text-[10px] text-blue-300 bg-[#0a0a0f] p-4 rounded-lg overflow-x-auto border border-[#1e1e2e]">
              {JSON.stringify(results, null, 2)}
            </pre>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">
              No results to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
