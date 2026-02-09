import React from 'react'
import { translations } from '../../translations'

interface Props {
  stats: any
  lang: 'sv' | 'en'
}

export default function StatsGrid({ stats, lang }: Props) {
  const t = translations[lang]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statActive}</p><p className="text-4xl font-black text-slate-900">{stats.active}</p></div><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">💼</div></div>
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statTotal}</p><p className="text-4xl font-black text-slate-900">{stats.totalCands}</p></div><div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl">👥</div></div>
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statNew}</p><p className="text-4xl font-black text-slate-900">{stats.newCands}</p></div><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">🔥</div></div>
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statInterview}</p><p className="text-4xl font-black text-slate-900">{stats.interview}</p></div><div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">🗣️</div></div>
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statOffer}</p><p className="text-4xl font-black text-slate-900">{stats.offer}</p></div><div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center text-xl">📝</div></div>
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statHired}</p><p className="text-4xl font-black text-slate-900">{stats.hired}</p></div><div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl">✅</div></div>
    </div>
  )
}