import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { translations } from '../translations'
import KanbanBoard from './KanbanBoard'
import Navbar from './dashboard/Navbar'
import StatsGrid from './dashboard/StatsGrid'
import JobCard from './dashboard/JobCard'
import CreateJobModal from './dashboard/CreateJobModal'
import ProfileModal from './dashboard/ProfileModal'
import CustomersView from './dashboard/CustomersView'
import TutorialWizard from './dashboard/TutorialWizard'

interface Props {
  role: string
  session: any
  lang: 'sv' | 'en'
}

export default function Dashboard({ role, session, lang }: Props) {
  const t = translations[lang]
  const [view, setView] = useState<'dashboard' | 'job' | 'customers'>('dashboard')
  const [jobs, setJobs] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [stats, setStats] = useState({ active: 0, totalCands: 0, newCands: 0, interview: 0, offer: 0, hired: 0 })
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

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
  
  async function createJob(jobData: any) { 
      setIsCreating(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) { 
          const { error } = await supabase.from('jobs').insert([{ ...jobData, user_id: user.id, status: 'active' }])
          if (!error) {
              fetchJobs(); fetchStats(); setShowCreateModal(false) 
          } else {
              alert('Kunde inte skapa annons: ' + error.message)
          }
      }
      setIsCreating(false) 
  }
  
  async function toggleJobStatus(job: any) { 
      const newStatus = job.status === 'active' ? 'closed' : 'active'
      setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j))
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id)
      if (error) { alert("Kunde inte ändra status. Du kanske inte har behörighet."); fetchJobs(); } else { fetchStats(); }
  }
  
  async function deleteJob(jobId: number, e: React.MouseEvent) { 
      e.stopPropagation()
      if (!confirm(t.deleteJobConfirm)) return
      await supabase.from('candidates').delete().eq('job_id', jobId)
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (!error) { fetchJobs(); fetchStats(); } 
  }

  function copyApplyLink(e: React.MouseEvent, jobId: number) { 
      e.stopPropagation()
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?apply=${jobId}`)
      alert(`${t.linkCopied}`) 
  }

  if (view === 'customers') return (
    <div className="min-h-screen bg-[#f8fafc]">
        <Navbar role={role} session={session} view={view} setView={setView} openProfile={() => setShowProfileModal(true)} setShowTutorial={setShowTutorial} lang={lang} />
        <CustomersView customers={customers} onDelete={deleteCustomer} lang={lang} />
    </div>
  )

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar role={role} session={session} view={view} setView={setView} openProfile={() => setShowProfileModal(true)} setShowTutorial={setShowTutorial} lang={lang} />
        {showTutorial && <TutorialWizard onClose={() => setShowTutorial(false)} lang={lang} />}
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
          <StatsGrid stats={stats} lang={lang} />

          <div className="flex justify-between items-end border-b border-slate-200 pb-6">
              <div><h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.myAds}</h1><p className="mt-1 text-slate-500 font-medium text-sm">{t.myAdsSub}</p></div>
              <button onClick={() => setShowCreateModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 transform active:scale-95">{t.createJobBtn}</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {jobs.map(job => (
               <JobCard 
                 key={job.id} 
                 job={job} 
                 onSelect={(j) => { setSelectedJob(j); setView('job') }} 
                 onDelete={deleteJob} 
                 onToggleStatus={toggleJobStatus} 
                 onCopyLink={copyApplyLink} 
                 lang={lang} 
               />
             ))}
          </div>

          {showCreateModal && <CreateJobModal onClose={() => setShowCreateModal(false)} onCreate={createJob} isCreating={isCreating} lang={lang} />}
          {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} session={session} role={role} lang={lang} />}
        </main>
      </div>
    )
  }
  
  return <div className="min-h-screen bg-[#fcfcfd] flex flex-col"><div className="flex-1 overflow-hidden"><KanbanBoard job={selectedJob} goBack={() => setView('dashboard')} lang={lang} /></div></div>
}