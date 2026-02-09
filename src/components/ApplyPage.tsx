import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { translations } from '../translations'

interface Props {
  jobId: string
  lang: 'sv' | 'en'
}

export default function ApplyPage({ jobId, lang }: Props) {
  const t = translations[lang]
  const [job, setJob] = useState<any>(null)
  const [recruiter, setRecruiter] = useState<any>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function getData() {
      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single()
      if (jobData) {
        setJob(jobData)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', jobData.user_id).single()
        setRecruiter(profileData)
      }
    }
    getData()
  }, [jobId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    let cvUrl = ''
    if (file) {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('cvs').upload(`public/${fileName}`, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('cvs').getPublicUrl(`public/${fileName}`)
        cvUrl = data.publicUrl
      }
    }
    const { error } = await supabase.from('candidates').insert([{
      job_id: jobId, name, email, linkedin_url: linkedin, cv_url: cvUrl, status: 'new'
    }])
    if (error) alert('Error: ' + error.message)
    else setDone(true)
    setLoading(false)
  }

  if (!job) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>

  if (job.status === 'closed') return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="bg-white p-12 rounded-[32px] shadow-2xl text-center max-w-md w-full border border-slate-100">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">{t.jobClosedTitle}</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{t.jobClosedMsg}</p>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{job.title}</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="bg-white p-12 rounded-[32px] shadow-2xl shadow-slate-200 text-center max-w-md w-full border border-slate-100">
        <div className="text-6xl mb-6">✨</div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">{t.applySuccess}</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{t.applySub} <b>{job.title}</b>.</p>
        <button onClick={() => window.location.reload()} className="text-indigo-600 font-bold hover:underline">{t.applyBack}</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-black leading-tight relative z-10">{job.title}</h1>
          <div className="flex flex-wrap gap-3 mt-4 relative z-10 font-bold text-indigo-100">
             {job.location && <span className="bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm">📍 {job.location}</span>}
             {job.work_mode && <span className="bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm">💼 {job.work_mode === 'onsite' ? t.modeOnsite : job.work_mode === 'remote' ? t.modeRemote : t.modeHybrid}</span>}
             {recruiter?.company_name && <span className="bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm">🏢 {recruiter.company_name}</span>}
          </div>
        </div>
        
        <div className="p-10 space-y-10">
          <div className="space-y-6">
             <div className="space-y-2">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Om rollen</h3>
               <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">{job.description}</p>
             </div>
             {job.requirements && (
               <div className="space-y-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Krav</h3>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-line font-medium leading-relaxed italic">
                    {job.requirements}
                 </div>
               </div>
             )}
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900">{t.applyTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.name}</label><input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.email}</label><input required type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase ml-1">LinkedIn URL</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.uploadCvReq}</label><div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative group"><input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} /><div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">📄</div><p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{file ? file.name : t.uploadCvReq}</p></div></div>
            <button disabled={loading} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-indigo-100">{loading ? '...' : t.applyBtn}</button>
          </form>

          {recruiter && (recruiter.full_name || recruiter.company_name) && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.hiringManager}</h4>
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                        {recruiter.full_name ? recruiter.full_name[0] : 'R'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg">{recruiter.full_name || 'Rekryterare'}</p>
                        <p className="text-sm text-slate-500 font-medium">
                            {recruiter.company_name} 
                            {recruiter.phone && <span className="opacity-50 mx-2">|</span>}
                            {recruiter.phone}
                        </p>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}