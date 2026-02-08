import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import KanbanBoard from './components/KanbanBoard'
import { translations } from './translations'

const LangToggle = ({ lang, setLang }: { lang: 'sv' | 'en', setLang: (l: 'sv'|'en') => void }) => (
  <button 
    onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
    className="fixed bottom-6 right-6 z-[9999] bg-white border border-slate-200 shadow-2xl px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 cursor-pointer active:scale-95 shadow-indigo-200/50"
  >
    <span>{lang === 'sv' ? '🇸🇪' : '🇺🇸'}</span>
    {lang === 'sv' ? 'Svenska' : 'English'}
  </button>
)

function ApplyPage({ jobId, lang }: { jobId: string, lang: 'sv' | 'en' }) {
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

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'sv' | 'en'>('sv')
  
  const urlParams = new URLSearchParams(window.location.search)
  const applyJobId = urlParams.get('apply')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); if (session) fetchProfile(session.user.id); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); if (session) fetchProfile(session.user.id); else setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    let { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (!data || error) {
       const { data: userData } = await supabase.auth.getUser()
       if (userData.user) {
         await supabase.from('profiles').upsert({ id: userId, email: userData.user.email, role: 'customer' })
         if (userData.user.email === 'bojidarivanov98@gmail.com') { data = { role: 'admin' } } 
         else { data = { role: 'customer' } }
       }
    }
    if (data) setRole(data.role)
  }

  return (
    <>
      <LangToggle lang={lang} setLang={setLang} />
      {applyJobId ? (
         <ApplyPage jobId={applyJobId} lang={lang} />
      ) : loading ? (
         <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
         </div>
      ) : !session ? (
         <AuthScreen lang={lang} />
      ) : (
         <Dashboard key={session.user.id} role={role} session={session} lang={lang} />
      )}
    </>
  )
}

function AuthScreen({ lang }: { lang: 'sv' | 'en' }) {
  const t = translations[lang]
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true); const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault(); setMsg(''); setLoading(true)
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
        <div className="flex flex-col items-center mb-8"><h1 className="text-3xl font-black text-white tracking-tight">{t.loginTitle}</h1><p className="text-slate-400 text-sm font-medium mt-1">{t.loginSubtitle}</p></div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl space-y-6">
          <form onSubmit={handleAuth} className="space-y-5">
            <input className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl font-bold hover:opacity-90">{loading ? '...' : (isLogin ? t.loginBtn : t.createAccountBtn)}</button>
          </form>
          <div className="text-center pt-2 border-t border-white/5"><button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 font-bold hover:text-white text-xs">{isLogin ? t.noAccount : t.hasAccount}</button></div>
        </div>
        {msg && <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-xs text-red-300 font-bold">{msg}</div>}
      </div>
    </div>
  )
}

function Dashboard({ role, session, lang }: { role: string, session: any, lang: 'sv' | 'en' }) {
  const t = translations[lang]
  const [view, setView] = useState<'dashboard' | 'job' | 'customers'>('dashboard')
  const [jobs, setJobs] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [stats, setStats] = useState({ active: 0, totalCands: 0, newCands: 0, interview: 0, offer: 0, hired: 0 })
  const [showCreateModal, setShowCreateModal] = useState(false); const [isCreating, setIsCreating] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  const [profName, setProfName] = useState(''); const [profCompany, setProfCompany] = useState(''); const [profPhone, setProfPhone] = useState('')
  const [newJobTitle, setNewJobTitle] = useState(''); const [newJobDesc, setNewJobDesc] = useState(''); const [newRequirements, setNewRequirements] = useState(''); const [newSalary, setNewSalary] = useState(''); const [newStartDate, setNewStartDate] = useState(''); const [newLocation, setNewLocation] = useState(''); const [newWorkMode, setNewWorkMode] = useState('onsite')

  useEffect(() => { fetchJobs(); fetchStats(); if(role === 'admin') fetchCustomers(); }, [role])

  async function fetchJobs() { 
    let query = supabase.from('jobs').select('*').order('id', { ascending: false })
    const { data } = await query
    
    if (data) {
        if (role === 'admin') {
            setJobs(data) 
        } else {
            const myJobs = data.filter(job => job.user_id === session.user.id)
            setJobs(myJobs)
        }
    }
  }

  async function fetchCustomers() { const { data } = await supabase.from('profiles').select('*'); setCustomers(data || []) }
  
  async function deleteCustomer(id: string) {
      if (!confirm(t.delCustConfirm)) return
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) alert('Error: ' + error.message)
      else fetchCustomers()
  }

  async function fetchStats() {
    let jobQuery = supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active')
    if (role !== 'admin') jobQuery = jobQuery.eq('user_id', session.user.id)
    const { count: jobCount } = await jobQuery

    let jobsQ = supabase.from('jobs').select('id')
    if (role !== 'admin') jobsQ = jobsQ.eq('user_id', session.user.id)
    const { data: userJobs } = await jobsQ
    const jobIds = (userJobs as any[])?.map(j => j.id) || []
    
    if (jobIds.length > 0) {
        const { count: candCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).in('job_id', jobIds)
        const { count: newCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).in('job_id', jobIds).eq('status', 'new')
        const { count: interviewCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).in('job_id', jobIds).eq('status', 'interview')
        const { count: offerCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).in('job_id', jobIds).eq('status', 'offer')
        const { count: hiredCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).in('job_id', jobIds).eq('status', 'hired')
        setStats({ active: jobCount || 0, totalCands: candCount || 0, newCands: newCount || 0, interview: interviewCount || 0, offer: offerCount || 0, hired: hiredCount || 0 })
    } else setStats({ active: 0, totalCands: 0, newCands: 0, interview: 0, offer: 0, hired: 0 })
  }
  
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').upsert({ id: session.user.id, role: role, full_name: profName, company_name: profCompany, phone: profPhone, email: session.user.email })
    if (!error) { setShowProfileModal(false); if(role==='admin') fetchCustomers(); alert(lang === 'sv' ? 'Sparat!' : 'Saved!') } else alert(error.message)
  }
  async function openProfile() { const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single(); if (data) { setProfName(data.full_name || ''); setProfCompany(data.company_name || ''); setProfPhone(data.phone || ''); } setShowProfileModal(true) }
  
  async function createJob(e: React.FormEvent) { 
      e.preventDefault(); setIsCreating(true); 
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) { 
          const { error } = await supabase.from('jobs').insert([{ 
              title: newJobTitle, 
              description: newJobDesc, 
              requirements: newRequirements, 
              salary_range: newSalary, 
              start_date: newStartDate, 
              location: newLocation, 
              work_mode: newWorkMode, 
              user_id: user.id, 
              status: 'active' 
          }]); 
          
          if (!error) {
              setNewJobTitle(''); setNewJobDesc(''); setNewRequirements(''); setNewSalary(''); setNewStartDate(''); setNewLocation(''); setNewWorkMode('onsite'); 
              fetchJobs(); fetchStats(); setShowCreateModal(false) 
          } else {
              alert('Kunde inte skapa annons: ' + error.message);
          }
      }; 
      setIsCreating(false) 
  }
  
  async function toggleJobStatus(job: any) { 
      const newStatus = job.status === 'active' ? 'closed' : 'active'; 
      setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j)); 
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id); 
      if (error) { alert("Kunde inte ändra status. Du kanske inte har behörighet."); fetchJobs(); } else { fetchStats(); }
  }
  
  async function deleteJob(jobId: number, e: React.MouseEvent) { e.stopPropagation(); if (!confirm(t.deleteJobConfirm)) return; await supabase.from('candidates').delete().eq('job_id', jobId); const { error } = await supabase.from('jobs').delete().eq('id', jobId); if (!error) { fetchJobs(); fetchStats(); } }
  function copyApplyLink(e: React.MouseEvent, jobId: number) { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?apply=${jobId}`); alert(`${t.linkCopied}`) }

  const CustomersView = () => (
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
                                    <td className="p-6 text-right"><button onClick={() => deleteCustomer(c.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">🗑️</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  )

  const Navbar = () => (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-12">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">M</div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Mini-ATS</span>
            </div>
            {role === 'admin' && (
                <div className="hidden md:flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                    <button onClick={() => setView('dashboard')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.navDashboard}</button>
                    <button onClick={() => setView('customers')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'customers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.navCustomers}</button>
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

  const TutorialWizard = () => { const [step, setStep] = useState(1); const steps = [ { id: 1, title: t.guideStep1Title, desc: t.guideStep1Desc, icon: '💼' }, { id: 2, title: t.guideStep2Title, desc: t.guideStep2Desc, icon: '🔗' }, { id: 3, title: t.guideStep3Title, desc: t.guideStep3Desc, icon: '⚡' }, { id: 4, title: t.guideStep4Title, desc: t.guideStep4Desc, icon: '👥' }, ]; const cur = steps.find(s => s.id === step); return (<div className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col border border-white/50"><div className="bg-indigo-600 p-6 text-white flex justify-between items-center"><h2 className="text-lg font-bold">📚 {t.guide}</h2><button onClick={() => setShowTutorial(false)} className="text-white/70 hover:text-white">✕</button></div><div className="p-8 text-center flex flex-col items-center flex-1"><div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">{cur?.icon}</div><h3 className="text-xl font-bold text-slate-900 mb-3">{cur?.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{cur?.desc}</p></div><div className="flex justify-center gap-2 pb-6">{steps.map(s => (<div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${s.id === step ? 'bg-indigo-600 w-6' : 'bg-slate-200 w-2'}`}></div>))}</div><div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between"><button onClick={() => setStep(s => s - 1)} disabled={step === 1} className={`text-slate-400 font-bold text-xs uppercase ${step === 1 ? 'opacity-0' : ''}`}>{t.guidePrev}</button><button onClick={() => step < 4 ? setStep(s => s + 1) : setShowTutorial(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">{step < 4 ? t.guideNext : t.guideDone}</button></div></div></div>) }

  if (view === 'customers') return <div className="min-h-screen bg-[#f8fafc]"><Navbar /><CustomersView /></div>

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        {showTutorial && <TutorialWizard />}
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statActive}</p><p className="text-4xl font-black text-slate-900">{stats.active}</p></div><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">💼</div></div>
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statTotal}</p><p className="text-4xl font-black text-slate-900">{stats.totalCands}</p></div><div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl">👥</div></div>
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statNew}</p><p className="text-4xl font-black text-slate-900">{stats.newCands}</p></div><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">🔥</div></div>
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statInterview}</p><p className="text-4xl font-black text-slate-900">{stats.interview}</p></div><div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">🗣️</div></div>
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statOffer}</p><p className="text-4xl font-black text-slate-900">{stats.offer}</p></div><div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center text-xl">📝</div></div>
              <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-between"><div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.statHired}</p><p className="text-4xl font-black text-slate-900">{stats.hired}</p></div><div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl">✅</div></div>
          </div>

          <div className="flex justify-between items-end border-b border-slate-200 pb-6"><div><h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.myAds}</h1><p className="mt-1 text-slate-500 font-medium text-sm">{t.myAdsSub}</p></div><button onClick={() => setShowCreateModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 transform active:scale-95">{t.createJobBtn}</button></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {jobs.map(job => (
              <div key={job.id} onClick={() => {setSelectedJob(job); setView('job')}} className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-100 border border-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative flex flex-col h-full">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"><button onClick={(e) => deleteJob(job.id, e)} className="bg-white/80 backdrop-blur p-2 rounded-xl shadow-lg hover:text-red-500 transition-colors border border-slate-100">🗑️</button></div>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full mb-6"></div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                   {job.location && <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">📍 {job.location}</span>}
                   {job.work_mode && <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-lg">💼 {job.work_mode}</span>}
                   {job.salary_range && <span className="text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-600 px-3 py-1.5 rounded-lg">💰 {job.salary_range}</span>}
                   {job.start_date && <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg">📅 {job.start_date}</span>}
                </div>
                <p className="text-slate-400 font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">{job.description}</p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleJobStatus(job) }} className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{job.status === 'active' ? t.statusActive : t.statusClosed}</button>
                      <button onClick={(e) => copyApplyLink(e, job.id)} className="w-8 h-8 bg-slate-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors border border-slate-200 font-bold">🔗</button>
                  </div>
                  <span className="text-slate-900 text-sm font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">{t.manage} <span>→</span></span>
                </div>
              </div>
             ))}
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><h2 className="text-2xl font-black text-slate-900">{t.createJobTitle}</h2><button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900 text-2xl font-bold transition-colors">✕</button></div>
                <div className="p-10 overflow-y-auto">
                  <form id="createJobForm" onSubmit={createJob} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.jobTitleLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} required placeholder={t.phTitle} /></div>
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.locLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newLocation} onChange={e => setNewLocation(e.target.value)} required placeholder={t.phLoc} /></div>
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.modeLabel}</label><select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold appearance-none" value={newWorkMode} onChange={e => setNewWorkMode(e.target.value)}><option value="onsite">{t.modeOnsite}</option><option value="hybrid">{t.modeHybrid}</option><option value="remote">{t.modeRemote}</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.salaryLabel}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-semibold transition-all" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder={t.phSalary} /></div>
                       <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.startLabel}</label><input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-semibold transition-all" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} /></div>
                    </div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-1">{t.jobDescLabel}</label><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold h-32 resize-none" value={newJobDesc} onChange={e => setNewJobDesc(e.target.value)} placeholder={t.phDesc} /></div>
                    <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1">{t.jobReqLabel}</label><textarea className="w-full p-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:bg-white focus:border-amber-300 outline-none font-semibold transition-all h-24 resize-none" value={newRequirements} onChange={e => setNewRequirements(e.target.value)} placeholder={t.phReq} /></div>
                  </form>
                </div>
                <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4"><button onClick={() => setShowCreateModal(false)} className="flex-1 p-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors">{t.cancel}</button><button form="createJobForm" disabled={isCreating} className="flex-[2] bg-indigo-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">{isCreating ? t.creating : t.save}</button></div>
              </div>
            </div>
          )}

          {showProfileModal && (
            <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col border border-slate-200">
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center"><h2 className="text-xl font-black text-slate-900">{t.profileTitle}</h2><button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-900">✕</button></div>
                <div className="p-10 space-y-6">
                    <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profName}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profName} onChange={e => setProfName(e.target.value)} placeholder="T.ex. Anna Andersson" /></div>
                    <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profCompany}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profCompany} onChange={e => setProfCompany(e.target.value)} placeholder="T.ex. Tech AB" /></div>
                    <div className="space-y-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wide ml-1">{t.profPhone}</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profPhone} onChange={e => setProfPhone(e.target.value)} placeholder="070-123 45 67" /></div>
                    <button onClick={saveProfile} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg">{t.profSave}</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }
  return <div className="min-h-screen bg-[#fcfcfd] flex flex-col"><div className="flex-1 overflow-hidden"><KanbanBoard job={selectedJob} goBack={() => setView('dashboard')} lang={lang} /></div></div>
}