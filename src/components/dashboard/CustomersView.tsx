import React from 'react'
import { translations } from '../../translations'

interface Props {
  customers: any[]
  onDelete: (id: string) => void
  lang: 'sv' | 'en'
}

export default function CustomersView({ customers, onDelete, lang }: Props) {
  const t = translations[lang]
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-black text-slate-900 mb-8">{t.navCustomers}</h2>
        <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-100">
            {customers.length === 0 ? <div className="p-12 text-center text-slate-500 font-medium">{t.noCust}</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t.custEmail}</th><th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t.custRole}</th><th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t.custName}</th><th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t.custCompany}</th><th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t.custPhone}</th><th className="p-6"></th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 font-bold text-indigo-600">{c.email || 'N/A'}</td>
                                    <td className="p-6"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>{c.role}</span></td>
                                    <td className="p-6 font-bold text-slate-900">{c.full_name || '-'}</td>
                                    <td className="p-6 font-medium text-slate-600">{c.company_name || '-'}</td>
                                    <td className="p-6 font-medium text-slate-600">{c.phone || '-'}</td>
                                    <td className="p-6 text-right"><button onClick={() => onDelete(c.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">🗑️</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  )
}