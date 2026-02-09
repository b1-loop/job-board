import React, { useEffect, useState } from 'react'
import { translations } from '../../translations'
import { supabase } from '../../supabaseClient'

interface Props {
  onClose: () => void
  session: any
  role: string
  lang: 'sv' | 'en'
}

export default function ProfileModal({ onClose, session, role, lang }: Props) {
  const t = translations[lang]
  const [profName, setProfName] = useState('')
  const [profCompany, setProfCompany] = useState('')
  const [profPhone, setProfPhone] = useState('')

  useEffect(() => {
    async function loadData() {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) { 
            setProfName(data.full_name || '')
            setProfCompany(data.company_name || '')
            setProfPhone(data.phone || '')
        }
    }
    loadData()
  }, [session.user.id])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').upsert({ 
        id: session.user.id, 
        role: role, 
        full_name: profName, 
        company_name: profCompany, 
        phone: profPhone, 
        email: session.user.email 
    })
    if (!error) { 
        alert(lang === 'sv' ? 'Sparat!' : 'Saved!')
        onClose() 
    } else {
        alert(error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col border border-slate-200">
        <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center"><h2 className="text-xl font-black text-slate-900">{t.profileTitle}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-900">✕</button></div>
        <div className="p-10 space-y-6">
            <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profName}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profName} onChange={e => setProfName(e.target.value)} placeholder="T.ex. Anna Andersson" /></div>
            <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profCompany}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profCompany} onChange={e => setProfCompany(e.target.value)} placeholder="T.ex. Tech AB" /></div>
            <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profPhone}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profPhone} onChange={e => setProfPhone(e.target.value)} placeholder="070-123 45 67" /></div>
            <button onClick={saveProfile} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg">{t.profSave}</button>
        </div>
      </div>
    </div>
  )
}