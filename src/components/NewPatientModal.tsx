import React, { useState } from 'react';
import { X, User, Activity, FileText, Heart, Droplet, Thermometer } from 'lucide-react';

export function NewPatientModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    initials: '',
    ageGender: '',
    hr: '',
    bp: '',
    spo2: '',
    temp: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine status roughly based on vitals mapping
    let status = 'STABLE';
    const hr = parseInt(formData.hr) || 80;
    const sysBp = parseInt(formData.bp.split('/')[0]) || 120;
    const spo2 = parseInt(formData.spo2) || 98;
    
    if (hr > 120 || sysBp < 90 || spo2 < 92) {
      status = 'CRITICAL';
    } else if (hr > 100 || sysBp > 140 || spo2 < 95) {
      status = 'URGENT';
    }

    const patientData = {
      initials: formData.initials || 'UN',
      ageGender: formData.ageGender || 'Unknown',
      status,
      id: `#PT-${Math.floor(Math.random() * 90000) + 10000}-A`,
      time: 'Just now',
      encounter: `#ENC-${Math.floor(Math.random() * 9000) + 1000}-X`,
      notes: formData.notes,
      vitals: [
        { icon: Heart, label: 'HEART RATE', value: formData.hr || '--', unit: 'bpm', alert: hr > 100 || hr < 50 },
        { icon: Activity, label: 'BLOOD PRESSURE', value: formData.bp || '--/--', unit: 'mmHg', alert: sysBp > 140 || sysBp < 90 },
        { icon: Droplet, label: 'SpO2', value: formData.spo2 || '--', unit: '%', alert: spo2 < 95 },
        { icon: Thermometer, label: 'TEMP', value: formData.temp || '--', unit: '°C', alert: parseFloat(formData.temp) > 38.0 }
      ]
    };
    
    onSubmit(patientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <User size={18} className="text-cyan-400" /> Waitlist: Ingest Patient Case
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Patient Initials</label>
              <input required type="text" value={formData.initials} onChange={e => setFormData({...formData, initials: e.target.value})} placeholder="e.g. JD" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Age & Gender</label>
              <input required type="text" value={formData.ageGender} onChange={e => setFormData({...formData, ageGender: e.target.value})} placeholder="e.g. 54M" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200" />
            </div>
          </div>
          
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 mt-2">
            <h3 className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2"><Activity size={14}/> Vitals (Observation)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">HR (bpm)</label>
                <input type="text" value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} placeholder="112" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">BP (mmHg)</label>
                <input type="text" value={formData.bp} onChange={e => setFormData({...formData, bp: e.target.value})} placeholder="120/80" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">SpO2 (%)</label>
                <input type="text" value={formData.spo2} onChange={e => setFormData({...formData, spo2: e.target.value})} placeholder="98" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Temp (°C)</label>
                <input type="text" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} placeholder="37.2" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none text-slate-200" />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><FileText size={14}/> Clinical Notes / Symptoms</label>
            <textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              rows={3} 
              placeholder="e.g. Patient presents with severe tearing chest pain radiating to the back. Sudden onset." 
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none text-slate-200"
            ></textarea>
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded transition-colors text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Ingest & Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
