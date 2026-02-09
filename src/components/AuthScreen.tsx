import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { translations } from '../translations'

interface Props {
  lang: 'sv' | 'en'
}

export default function AuthScreen({ lang }: Props) {
  const t = translations[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    if (isLogin) { 
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMsg(error.message) 
    } else { 
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) setMsg(error.message)
        else if (data.user) { 
            await supabase.from('profiles').upsert([{ id: data.user.id, role: 'customer', email: email }])
            setMsg(lang === 'sv' ? 'Konto skapat!' : 'Account created!') 
        } 
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="relative z-10 w-full max-w-[420px] px-4">
        <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">{t.loginTitle}</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">{t.loginSubtitle}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl space-y-6">
          <form onSubmit={handleAuth} className="space-y-5">
            <input className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl font-bold hover:opacity-90">{loading ? '...' : (isLogin ? t.loginBtn : t.createAccountBtn)}</button>
          </form>
          <div className="text-center pt-2 border-t border-white/5">
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 font-bold hover:text-white text-xs">{isLogin ? t.noAccount : t.hasAccount}</button>
          </div>
        </div>
        {msg && <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-xs text-red-300 font-bold">{msg}</div>}
      </div>
    </div>
  )
}