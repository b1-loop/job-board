import { supabase } from '../supabaseClient'
import { translations } from '../translations'

interface Props {
  role: string
  session: any
  navigate: (page: string) => void
  setShowTutorial: (v: boolean) => void
  openProfile: () => void
  lang: 'sv' | 'en'
}

export default function Navbar({ role, session, navigate, setShowTutorial, openProfile, lang }: Props) {
  const t = translations[lang]
  const currentView = new URLSearchParams(window.location.search).get('page') || 'dashboard'

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-12">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('dashboard')}>
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">M</div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Mini-ATS</span>
            </div>
            {role === 'admin' && (
                <div className="hidden md:flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                    <button onClick={() => navigate('dashboard')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.navDashboard}</button>
                    <button onClick={() => navigate('customers')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentView === 'customers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.navCustomers}</button>
                </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTutorial(true)} className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm"><span>❓</span> {t.guide}</button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors" onClick={openProfile}>
                {role === 'admin' && <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded ml-2">{t.adminBadge}</span>}
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs border border-indigo-200">{session.user.email[0].toUpperCase()}</div>
                <div className="text-right"><p className="text-xs font-bold text-slate-700">{session.user.email}</p><p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">{t.profileSettings}</p></div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-red-500 font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">{t.logout}</button>
          </div>
      </div>
    </nav>
  )
}