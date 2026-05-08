import React, { useEffect, useState, useRef } from 'react';
import { Database, Terminal, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LogEvent = {
  id: string;
  timestamp: string;
  source: string;
  type: 'FHIR' | 'MCP' | 'A2A' | 'SYS';
  message: string;
  details?: string;
  color: string;
};

const INITIAL_LOGS: LogEvent[] = [
  { id: '1', timestamp: '14:02:11.401', source: 'SYS_INIT', type: 'SYS', color: 'text-slate-500', message: 'MEDOS Network active.' },
  { id: '2', timestamp: '14:02:12.100', source: 'FHIR_INGEST', type: 'FHIR', color: 'text-emerald-400', message: 'Observation Resource Received: Vitals' },
  { id: '3', timestamp: '14:02:12.350', source: 'ER_AGENT', type: 'A2A', color: 'text-indigo-400', message: 'Triage anomaly detected -> Handoff to ER_Agent' },
  { id: '4', timestamp: '14:02:13.002', source: 'ER_AGENT', type: 'MCP', color: 'text-amber-400', message: 'Tool Call: query_ehr_history(patient_id="PT-77129-C")', details: '{"status": 200, "records": 4}' },
];

export function SystemLogs({ paused = false }: { paused?: boolean }) {
  const [logs, setLogs] = useState<LogEvent[]>(INITIAL_LOGS);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Listen to external custom logs
  useEffect(() => {
    const handleNewLog = (e: any) => {
      setLogs((prev) => [...prev, e.detail].slice(-50));
    };
    window.addEventListener('sys-log', handleNewLog);
    return () => window.removeEventListener('sys-log', handleNewLog);
  }, []);

  // Simulate incoming logs
  useEffect(() => {
    if (paused) return;
    let count = 5;
    const interval = setInterval(() => {
      const newLog = generateRandomLog(count.toString());
      setLogs((prev) => [...prev, newLog].slice(-50)); // Keep last 50
      count++;
    }, 3500);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div className="tech-panel h-[600px] lg:h-[calc(100vh-140px)] flex flex-col border-cyan-500/20">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wider flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400" />
          SYSTEM STREAM (MCP / FHIR)
        </h2>
        <div className="flex items-center gap-3 text-[10px] uppercase font-mono font-bold tracking-wider">
          <span className="text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> MCP</span>
          <span className="text-indigo-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> A2A</span>
          <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FHIR</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1 scrollbar-hide">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-1 hover:bg-slate-800/30 rounded px-2 -mx-2 transition-colors border-l-2 border-transparent hover:border-slate-700"
            >
              <div className="flex gap-3">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`${log.color} shrink-0 w-20`}>{log.type}</span>
                <span className="text-slate-400 shrink-0 w-24 truncate">{log.source}</span>
                <span className="text-slate-300 whitespace-pre-wrap word-break flex-1">{log.message}</span>
              </div>
              {log.details && (
                <div className="ml-52 mt-1 pl-3 border-l-2 border-slate-800 text-slate-500 whitespace-pre-wrap flex items-start gap-2">
                  <Code size={12} className="relative top-0.5 shrink-0" />
                  {log.details}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function generateRandomLog(id: string): LogEvent {
  const events: Partial<LogEvent>[] = [
    { type: 'A2A', source: 'SUPERVISOR', color: 'text-indigo-400', message: 'Delegation sent to Rad_Agent: scan_review(img_771)' },
    { type: 'MCP', source: 'RAD_AGENT', color: 'text-amber-400', message: 'Tool Call: run_cv_model(target="mediastinum", img="CXR_01")', details: '{"model": "med-cv-9", "latency_ms": 420}' },
    { type: 'A2A', source: 'RAD_AGENT', color: 'text-indigo-400', message: 'Handoff back to SUPERVISOR. Confidence 94% on widened mediastinum.' },
    { type: 'FHIR', source: 'SYSTEM', color: 'text-emerald-400', message: 'DiagnosticReport generated and posted to FHIR endpoint.' },
    { type: 'MCP', source: 'ICU_AGENT', color: 'text-amber-400', message: 'Tool Call: fetch_latest_vitals(limit=5)' },
    { type: 'FHIR', source: 'EHR_SYNC', color: 'text-emerald-400', message: 'PUT /Condition/1192', details: '{"code": "I71.00", "display": "Dissection of unspecified site of aorta"}' },
    { type: 'A2A', source: 'CLINICAL_REAS', color: 'text-indigo-400', message: 'Updated differential diagnosis probabilities.' },
    { type: 'MCP', source: 'PHARM_AGENT', color: 'text-amber-400', message: 'Tool Call: check_interactions(d1="esmolol", meds=["lisinopril"])', details: '{"interaction_found": true, "severity": "moderate"}' }
  ];
  const e = events[Math.floor(Math.random() * events.length)];
  
  const now = new Date();
  const timeInfo = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  
  return {
    id,
    timestamp: timeInfo,
    type: e.type!,
    source: e.source!,
    color: e.color!,
    message: e.message!,
    details: e.details
  };
}
