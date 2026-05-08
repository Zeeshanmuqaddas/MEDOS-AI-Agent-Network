import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, ShieldAlert, Cpu, Network, Stethoscope, 
  Settings, Users, Database, Syringe, FileText, Bell, Map, BrainCircuit, Play, Loader2, Plus, Heart, Droplet, Thermometer
} from 'lucide-react';
import { PatientOverview } from './components/PatientOverview';
import { AgentNetwork } from './components/AgentNetwork';
import { ClinicalReasoning } from './components/ClinicalReasoning';
import { SystemLogs } from './components/SystemLogs';
import { NewPatientModal } from './components/NewPatientModal';
import { analyzePatientCase } from './lib/gemini';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for the autonomous workflow
  const [simState, setSimState] = useState<'idle' | 'ingesting' | 'reasoning' | 'complete'>('idle');
  const [patientData, setPatientData] = useState<any>(null);
  const [agentStates, setAgentStates] = useState<any>(null);
  const [reasoningData, setReasoningData] = useState<any>(null);
  const [logsPaused, setLogsPaused] = useState(false);

  const runSimulation = async (customConfig?: any) => {
    if (simState === 'ingesting' || simState === 'reasoning') return;
    setSimState('ingesting');
    setLogsPaused(true);
    
    // Use inputted data or fall back to simulated shock case
    const ptData = customConfig || {
      initials: "SJ", ageGender: "28F", status: "URGENT", id: "#PT-88210-A", time: "Just now (Triage)",
      encounter: "#ENC-1029-X",
      vitals: [
        { icon: Heart, label: "HEART RATE", value: "135", unit: "bpm", alert: true },
        { icon: Activity, label: "BLOOD PRESSURE", value: "82/45", unit: "mmHg", alert: true },
        { icon: Droplet, label: "SpO2", value: "91", unit: "%", alert: true },
        { icon: Thermometer, label: "TEMP", value: "39.8", unit: "°C", alert: true }
      ],
      notes: "Extreme tachycardia and hypotension. High grade fever."
    };

    setPatientData(ptData);

    // Step 1: Ingesting new FHIR data
    window.dispatchEvent(new CustomEvent('sys-log', { detail: { id: Date.now().toString(), timestamp: new Date().toISOString().substring(11,23), type: 'FHIR', source: 'SYS_INGEST', color: 'text-emerald-400', message: `New FHIR Bundle received. Encounter ${ptData.encounter}` } }));
    
    setAgentStates({ er: 'active', icu: 'idle', rad: 'idle', pharm: 'idle', gen: 'idle', hosp: 'idle', outbreak: 'idle' });
    setReasoningData({
      confidence: 0,
      differentials: [],
      riskLevel: "ASSESSING...",
      riskScore: 20,
      chain: ["Analyzing initial vitals and symptoms..."],
      actions: []
    });

    // Start background Gemini analysis
    let analysisPromise = analyzePatientCase(ptData).catch(err => {
      console.error(err);
      return null;
    });

    await new Promise(r => setTimeout(r, 2000));
    
    // Step 2: Agent collaboration
    setSimState('reasoning');
    setAgentStates({ er: 'processing', icu: 'active', rad: 'idle', pharm: 'processing', gen: 'processing', hosp: 'idle', outbreak: 'idle' });
    
    window.dispatchEvent(new CustomEvent('sys-log', { detail: { id: Date.now().toString(), timestamp: new Date().toISOString().substring(11,23), type: 'A2A', source: 'SUPERVISOR', color: 'text-indigo-400', message: 'Triage anomaly detected -> Handoff to ER_Agent and ICU_AGENT.' } }));

    setReasoningData((prev: any) => ({
      ...prev,
      confidence: 35,
      riskLevel: "ESCALATING",
      riskScore: ptData.status === 'CRITICAL' ? 75 : 45,
      chain: [
        "1. Extracted key anomalies from FHIR observation resource",
        "2. Querying A2A Network for context and differential match...",
      ]
    }));

    await new Promise(r => setTimeout(r, 3000));

    // Await AI analysis completion
    const aiResult = await analysisPromise;

    // Step 3: Result
    setSimState('complete');
    setAgentStates({ er: 'idle', icu: 'active', rad: 'idle', pharm: 'active', gen: 'idle', hosp: 'idle', outbreak: 'processing' });
    
    if (aiResult) {
       window.dispatchEvent(new CustomEvent('sys-log', { detail: { id: Date.now().toString(), timestamp: new Date().toISOString().substring(11,23), type: 'MCP', source: 'PHARM_AGENT', color: 'text-amber-400', message: 'Tool Call: synthesize_drug_interactions()' } }));
       window.dispatchEvent(new CustomEvent('sys-log', { detail: { id: Date.now().toString(), timestamp: new Date().toISOString().substring(11,23), type: 'SYS', source: 'SUPERVISOR', color: 'text-slate-200', message: 'Finalizing AI clinical reasoning and outputting actionable plan.' } }));
       setReasoningData(aiResult);
    } else {
       // Fallback mock if AI failed
       setReasoningData({
        confidence: 96,
        differentials: [
          { name: "Septic Shock (Source: Unknown)", prob: 96 },
          { name: "Systemic Inflammatory Response", prob: 12 }
        ],
        riskLevel: "CRITICAL ALERT",
        riskScore: 95,
        chain: [
          "1. Extreme vitals anomalies detected (ER Agent)",
          "2. Lactic Acid > 4.0 mmol/L fetched from EHR via MCP (ICU Agent)",
        ],
        actions: [
          { title: "Immediate Fluid Resuscitation", desc: "30mL/kg crystalloid IV stat (ICU Protocol)", type: "alert" }
        ]
      });
    }
    
    setTimeout(() => setLogsPaused(false), 5000);
  };
  
  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-slate-800 bg-slate-950 flex flex-col items-center md:items-stretch transition-all duration-300 z-10 hidden sm:flex">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BrainCircuit size={22} className="relative z-10" />
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 rounded-lg"></div>
          </div>
          <div className="ml-3 hidden md:block">
            <h1 className="font-bold text-slate-100 tracking-tight leading-tight">MEDOS AI</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">Agent Network</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', icon: Network, label: 'Sys Dash' },
            { id: 'patients', icon: Users, label: 'FHIR Patient' },
            { id: 'agents', icon: Cpu, label: 'A2A Network' },
            { id: 'logs', icon: Database, label: 'MCP Logs' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-3 py-3 rounded-md transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'tech-text-glow' : ''} />
              <span className="ml-3 font-medium text-sm hidden md:block">{item.label}</span>
            </button>
          ))}
          
          <div className="mt-8 border-t border-slate-800 pt-6 px-3">
             <button
                onClick={() => setIsModalOpen(true)}
                disabled={simState !== 'idle' && simState !== 'complete'}
                className="w-full flex items-center justify-center md:justify-start gap-2 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30 text-rose-300 py-3 px-3 rounded-lg transition-all"
             >
               <Plus size={18} className="shrink-0" />
               <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
                 Ingest New Case
               </span>
             </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-800 hidden md:block shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sys Secure</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-slate-950"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-colors ${simState === 'reasoning' ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
              {simState === 'reasoning' || simState === 'ingesting' ? <Loader2 size={14} className="text-amber-400 animate-spin" /> : <Activity size={14} className="text-cyan-400" />}
              <span className={`text-xs font-mono ${simState === 'reasoning' || simState === 'ingesting' ? 'text-amber-300' : 'text-slate-300'}`}>
                {simState === 'reasoning' || simState === 'ingesting' ? 'A2A_SYNC_BUSY' : 'A2A_SYNC_ACTIVE'}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 flex items-center gap-2 hidden md:flex">
              <Database size={14} className="text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">FHIR_v4.0.1</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Query MCP tools..." 
                className="bg-slate-900 border border-slate-800 text-sm text-slate-300 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={simState !== 'idle' && simState !== 'complete'}
                className="md:hidden flex items-center justify-center text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/30"
             >
               {simState === 'idle' || simState === 'complete' ? <Plus size={20} /> : <Loader2 size={20} className="animate-spin" />}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-6 z-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            {/* Top Span: Patient Data (FHIR) */}
            <div className="lg:col-span-12">
              <PatientOverview data={patientData} />
            </div>

            {/* Middle Left: Agent Network (A2A) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <AgentNetwork states={agentStates} />
              <ClinicalReasoning data={reasoningData} />
            </div>
            
            {/* Middle Right: System Logs (MCP) */}
            <div className="lg:col-span-5 relative">
              <SystemLogs paused={logsPaused} />
            </div>
          </div>
        </div>
      </main>

      <NewPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={(data) => runSimulation(data)} 
      />
    </div>
  );
}
