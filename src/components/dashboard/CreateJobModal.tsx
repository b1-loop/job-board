import React, { useState } from 'react'
import { translations } from '../../translations'

interface Props {
  onClose: () => void
  onCreate: (jobData: any) => Promise<void>
  isCreating: boolean
  lang: 'sv' | 'en'
}

export default function CreateJobModal({ onClose, onCreate, isCreating, lang }: Props) {
  const t = translations[lang]
  // Local state for form fields
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDesc, setNewJobDesc] = useState('')
  const [newRequirements, setNewRequirements] = useState('')
  const [newSalary, setNewSalary] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newWorkMode, setNewWorkMode] = useState('onsite')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreate({
        title: newJobTitle,
        description: newJobDesc,
        requirements: newRequirements,
        salary_range: newSalary,
        start_date: newStartDate,
        location: newLocation,
        work_mode: newWorkMode
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-200">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><h2 className="text-2xl font-black text-slate-900">{t.createJobTitle}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-900 text-2xl font-bold transition-colors">✕</button></div>
        <div className="p-10 overflow-y-auto">
          <form id="createJobForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.jobTitleLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} required placeholder={t.phTitle} /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.locLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newLocation} onChange={e => setNewLocation(e.target.value)} required placeholder={t.phLoc} /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.modeLabel}</label><select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold appearance-none" value={newWorkMode} onChange={e => setNewWorkMode(e.target.value)}><option value="onsite">{t.modeOnsite}</option><option value="hybrid">{t.modeHybrid}</option><option value="remote">{t.modeRemote}</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.salaryLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-semibold transition-all" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder={t.phSalary} /></div>
                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.startLabel}</label><input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-semibold transition-all" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} /></div>
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.jobDescLabel}</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold h-32 resize-none" value={newJobDesc} onChange={e => setNewJobDesc(e.target.value)} placeholder={t.phDesc} />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1">{t.jobReqLabel}</label>
                <textarea className="w-full p-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:bg-white focus:border-amber-300 outline-none font-semibold transition-all h-24 resize-none" value={newRequirements} onChange={e => setNewRequirements(e.target.value)} placeholder={t.phReq} />
            </div>
          </form>
        </div>
        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4"><button onClick={onClose} className="flex-1 p-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors">{t.cancel}</button><button form="createJobForm" disabled={isCreating} className="flex-[2] bg-indigo-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">{isCreating ? t.creating : t.save}</button></div>
      </div>
    </div>
  )
}