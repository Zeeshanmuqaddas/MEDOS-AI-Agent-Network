import React from 'react';
import { Activity, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ClinicalReasoning({ data }: { data?: any }) {
  const defData = {
    confidence: 92,
    differentials: [
      { name: "Aortic Dissection (Type A)", prob: 92 },
      { name: "Acute Myocardial Infarction", prob: 15 },
      { name: "Pulmonary Embolism", prob: 8 }
    ],
    riskLevel: "CRITICAL ESCALATION",
    riskScore: 89,
    chain: [
      "1. Widened mediastinum on portable CXR (Radiology Agent)",
      "2. Tearing chest pain radiating to back (ER Agent text sim)",
      "3. BP differential > 20mmHg between arms (Vitals FHIR stream)"
    ],
    actions: [
      { title: "Immediate CTA (Chest)", desc: "Delegated via Radiology Agent tool", type: "alert" },
      { title: "Target HR < 60bpm, SBP < 120", desc: "Esmolol IV infusion (Pharmacy Agent verified)", type: "check" }
    ]
  };

  const r = data || defData;

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-rose-500";
    if (score >= 50) return "text-amber-500";
    return "text-cyan-500";
  };

  return (
    <div className="tech-panel p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wider flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          CLINICAL REASONING AGENT
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Confidence:</span>
          <div className="w-16 md:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-1000" style={{ width: `${r.confidence}%` }} />
          </div>
          <span className="text-xs font-bold text-cyan-400 font-mono">{r.confidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Differential Diagnosis */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={12} /> Differential Diagnosis Ranking
          </h3>
          <div className="space-y-2 min-h-[120px]">
            {r.differentials.length === 0 && (
              <div className="text-xs text-slate-500 font-mono italic animate-pulse">Running inferences...</div>
            )}
            {r.differentials.map((diff: any, i: number) => (
              <DiagRow key={i} rank={i + 1} name={diff.name} prob={diff.prob} isTop={i === 0} />
            ))}
          </div>
        </div>

        {/* Reasoning Chain */}
        <div className="pl-0 md:pl-6 md:border-l border-slate-800">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Risk Score
             </h3>
             <span className={`text-xs font-mono font-bold ${getRiskColor(r.riskScore)}`}>{r.riskLevel}</span>
          </div>
          
          <div className="flex items-end gap-3 mb-4">
            <span className={`text-5xl font-light leading-none ${getRiskColor(r.riskScore)}`}>{r.riskScore}</span>
            <span className="text-sm font-mono text-slate-500 pb-1">/ 100</span>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-slate-300 font-mono leading-relaxed border-l-2 border-slate-700 pl-3">
              <span className="text-slate-500 block mb-1">EVIDENCE CHAIN:</span>
              {r.chain.map((c: string, i: number) => (
                <div key={i} className="mb-1">{c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShieldAlert size={12} /> Autonomous Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[60px]">
          {r.actions.length === 0 && (
            <div className="text-xs text-slate-500 font-mono italic animate-pulse col-span-2 text-center mt-2">Waiting for robust confidence threshold...</div>
          )}
          {r.actions.map((act: any, i: number) => (
            <div key={i} className={`${act.type === 'alert' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-cyan-500/10 border-cyan-500/20'} border p-3 rounded-md flex items-start gap-3`}>
              {act.type === 'alert' ? <AlertTriangle className="text-rose-400 mt-0.5 shrink-0" size={16} /> : <CheckCircle2 className="text-cyan-400 mt-0.5 shrink-0" size={16} />}
              <div>
                <div className={`text-xs font-bold uppercase ${act.type === 'alert' ? 'text-rose-300' : 'text-cyan-300'}`}>{act.title}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">{act.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagRow({ rank, name, prob, isTop }: { key?: React.Key, rank: number, name: string, prob: number, isTop?: boolean }) {
  return (
    <div className={`p-2 rounded border flex items-center justify-between ${
      isTop ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800/50'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono font-bold ${isTop ? 'text-rose-400' : 'text-slate-500'}`}>#{rank}</span>
        <span className={`text-sm ${isTop ? 'text-rose-200' : 'text-slate-400'}`}>{name}</span>
      </div>
      <span className={`text-xs font-mono ${isTop ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>{prob}%</span>
    </div>
  )
}
