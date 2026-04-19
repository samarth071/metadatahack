import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layout, FileJson, ArrowRight, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Start from Template',
      desc: 'Pick a pre-built workflow for common data tasks.',
      icon: Layout,
      color: 'bg-blue-500/10 text-blue-400',
      action: () => navigate('/builder?mode=template')
    },
    {
      title: 'Describe with AI',
      desc: 'Tell us what you want and AI will build it.',
      icon: Sparkles,
      color: 'bg-indigo-500/10 text-indigo-400',
      action: () => navigate('/builder?mode=ai')
    },
    {
      title: 'Build Manually',
      desc: 'Start with a clean canvas and drag your own nodes.',
      icon: FileJson,
      color: 'bg-emerald-500/10 text-emerald-400',
      action: () => navigate('/builder')
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-4xl w-full text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono uppercase tracking-widest mb-8">
          <Zap className="w-3 h-3" /> Now Powered by Gemini 1.5
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold font-mono mb-6 tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-blue-400">
            MetaFlow AI
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed">
          The intelligent, no-code workflow builder for modern data teams. Automate pipeline monitoring and PII detection in minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={opt.action}
              className="group p-8 text-left bg-[#111118]/80 border border-[#1e1e2e] rounded-3xl hover:border-indigo-500/50 hover:bg-[#1a1a2e] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className={`p-4 rounded-2xl w-fit mb-6 ${opt.color}`}>
                <opt.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                {opt.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {opt.desc}
              </p>
              
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-24 text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] z-10">
        Engineered for Data Reliability
      </div>
    </div>
  );
};

export default Landing;
