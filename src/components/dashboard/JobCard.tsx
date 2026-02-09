import React from 'react'
import { translations } from '../../translations'

interface Props {
  job: any
  onSelect: (job: any) => void
  onDelete: (id: number, e: React.MouseEvent) => void
  onToggleStatus: (job: any) => void
  onCopyLink: (e: React.MouseEvent, id: number) => void
  lang: 'sv' | 'en'
}

export default function JobCard({ job, onSelect, onDelete, onToggleStatus, onCopyLink, lang }: Props) {
  const t = translations[lang]
  return (
    <div onClick={() => onSelect(job)} className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-100 border border-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative flex flex-col h-full">
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => onDelete(job.id, e)} className="bg-white/80 backdrop-blur p-2 rounded-xl shadow-lg hover:text-red-500 transition-colors border border-slate-100">🗑️</button>
      </div>
      <div className="h-1.5 w-16 bg-indigo-600 rounded-full mb-6"></div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
      <div className="flex flex-wrap gap-2 mb-6">
          {job.location && <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">📍 {job.location}</span>}
          {job.work_mode && <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-lg">💼 {job.work_mode}</span>}
          {job.salary_range && <span className="text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-600 px-3 py-1.5 rounded-lg">💰 {job.salary_range}</span>}
          {job.start_date && <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg">📅 {job.start_date}</span>}
      </div>
      <p className="text-slate-400 font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">
          {job.description.replace(/<[^>]*>?/gm, '')}
      </p>
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
        <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onToggleStatus(job) }} className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{job.status === 'active' ? t.statusActive : t.statusClosed}</button>
            <button onClick={(e) => onCopyLink(e, job.id)} className="w-8 h-8 bg-slate-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors border border-slate-200 font-bold">🔗</button>
        </div>
        <span className="text-slate-900 text-sm font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">{t.manage} <span>→</span></span>
      </div>
    </div>
  )
}