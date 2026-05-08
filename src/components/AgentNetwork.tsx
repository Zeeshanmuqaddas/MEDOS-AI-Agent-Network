import React from 'react';
import { Cpu, Stethoscope, Share2, Syringe, Eye, BrainCircuit, Heart, Dna, ActivitySquare, AlertOctagon } from 'lucide-react';
import { motion } from 'motion/react';

const agents = [
  { id: 'er', name: 'ER Agent', icon: Stethoscope, status: 'active', color: 'rose' },
  { id: 'icu', name: 'ICU Agent', icon: Heart, status: 'idle', color: 'emerald' },
  { id: 'rad', name: 'Radiology', icon: Eye, status: 'processing', color: 'amber' },
  { id: 'pharm', name: 'Pharmacy', icon: Syringe, status: 'idle', color: 'indigo' },
  { id: 'gen', name: 'Genomics', icon: Dna, status: 'idle', color: 'purple' },
  { id: 'hosp', name: 'Operations', icon: ActivitySquare, status: 'idle', color: 'slate' },
  { id: 'outbreak', name: 'Outbreak AI', icon: AlertOctagon, status: 'idle', color: 'rose' },
];



export function AgentNetwork({ states }: { states?: Record<string, string> }) {
  const currentAgents = agents.map(a => ({
    ...a,
    status: states ? (states[a.id] || 'idle') : a.status
  }));

  return (
    <div className="tech-panel p-5 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wider flex items-center gap-2">
          <Share2 size={16} className="text-cyan-400" />
          A2A COMM NETWORK
        </h2>
        <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          LIVE SYNCHRONIZATION
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center py-10">
        {/* Supervisor at the center top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative mb-2 z-10 w-16 h-16 rounded-xl border border-cyan-500/30 bg-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.15)] flex justify-center items-center">
            <BrainCircuit size={28} className="text-cyan-400" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute -inset-[1px] border border-cyan-500/50 rounded-xl rounded-tr-none" 
            />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-slate-950 px-2">Master Supervisor</span>
        </div>

        {/* Lines connecting Supervisor to Agents */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {currentAgents.map((agent, i) => {
            const x = 100 / (currentAgents.length + 1) * (i + 1);
            return (
              <path 
                key={`line-${i}`}
                d={`M 50% 64px L ${x}% 80%`}
                stroke="currentColor" 
                className={agent.status === 'processing' ? 'text-amber-500/30' : agent.status === 'active' ? 'text-rose-500/30' : 'text-slate-800'}
                strokeWidth="2"
                fill="none"
              />
            );
          })}
          {/* Animated packets on active lines */}
          {currentAgents.map((agent, i) => {
            if (agent.status === 'idle') return null;
            const x = 100 / (currentAgents.length + 1) * (i + 1);
            const color = agent.status === 'active' ? '#f43f5e' : '#fbbf24';
            const duration = agent.status === 'active' ? 1.5 : 2.5;
            // Direction based on agent type / status to simulate A2A flow
            const pathData = agent.status === 'active' 
              ? `path('M ${x}% 80% L 50% 64px')` // Agent to Master
              : `path('M 50% 64px L ${x}% 80%')`; // Master to Agent
              
            return (
              <motion.circle 
                key={`packet-${i}`} 
                r="3" 
                fill={color} 
                style={{ offsetPath: pathData }} 
                animate={{ offsetDistance: ['0%', '100%'] }} 
                transition={{ duration, repeat: Infinity, ease: 'linear' }} 
              />
            );
          })}
        </svg>

        {/* The Specialized Agents at the bottom */}
        <div className="w-full flex justify-around items-end pt-16 relative z-10">
          {currentAgents.map((agent, i) => (
            <div key={agent.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center relative mb-2 bg-slate-900 transition-colors
                ${agent.status === 'active' ? 'border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 
                  agent.status === 'processing' ? 'border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
                  'border-slate-700 text-slate-500'}
              `}>
                {agent.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    className="absolute -inset-[3px] rounded-full border-2 border-dashed border-amber-500/40"
                  />
                )}
                <agent.icon size={18} className={`md:w-5 md:h-5 relative z-10 ${agent.status === 'processing' ? 'animate-pulse' : ''}`} />
                {agent.status !== 'idle' && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute inset-0 rounded-full border ${agent.status === 'active' ? 'border-rose-500' : 'border-amber-500'}`}
                  />
                )}
              </div>
              <span className="text-[9px] md:text-[10px] font-mono text-slate-400 max-w-[48px] md:max-w-[60px] leading-tight text-center uppercase">{agent.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
