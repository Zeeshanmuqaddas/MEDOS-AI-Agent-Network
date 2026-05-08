import React from 'react';
import { User, Heart, Activity, Thermometer, Droplet, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function PatientOverview({ data }: { data?: any }) {
  const p = data || {
    initials: "JD", ageGender: "54M", status: "CRITICAL", id: "#PT-77129-C", time: "2 hrs ago (ER)",
    encounter: "#ENC-9281-B",
    vitals: [
      { icon: Heart, label: "HEART RATE", value: "112", unit: "bpm", alert: true },
      { icon: Activity, label: "BLOOD PRESSURE", value: "90/60", unit: "mmHg", alert: true },
      { icon: Droplet, label: "SpO2", value: "94", unit: "%" },
      { icon: Thermometer, label: "TEMP", value: "38.2", unit: "°C" }
    ]
  };

  return (
    <div className="tech-panel p-5 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wider flex items-center gap-2">
          <User size={16} className="text-cyan-400" />
          ACTIVE FHIR CONTEXT
        </h2>
        <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Encounter: {p.encounter}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Patient Info */}
        <div className="flex-shrink-0 flex items-center gap-4 border-r border-slate-800 pr-6">
          <div className="relative w-16 h-16 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center">
            <User size={32} className="text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">{p.initials}, {p.ageGender}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${p.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {p.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">ID: {p.id}</p>
            <p className="text-xs text-slate-500 mt-0.5">Admitted: {p.time}</p>
          </div>
        </div>

        {/* Vitals Grid (Observation Resources) */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {p.vitals.map((v: any, i: number) => (
            <VitalCard key={i} icon={v.icon} label={v.label} value={v.value} unit={v.unit} alert={v.alert} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit, alert = false }: { key?: React.Key, icon: any, label: string, value: string, unit: string, alert?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${alert ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900/50 border-slate-800'} relative overflow-hidden group`}>
      {alert && (
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-rose-500/10 pointer-events-none"
        />
      )}
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <Icon size={14} className={alert ? 'text-rose-400' : 'text-cyan-400'} />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-1 relative z-10">
        <span className={`text-2xl font-semibold leading-none ${alert ? 'text-rose-300' : 'text-slate-200'}`}>
          {value}
        </span>
        <span className="text-xs text-slate-500 font-mono mb-0.5">{unit}</span>
      </div>
    </div>
  );
}
