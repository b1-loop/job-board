import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LangToggle from './components/LangToggle'
import SimpleRouter from './router'
import AuthScreen from './components/AuthScreen'
import ApplyPage from './components/ApplyPage'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'sv' | 'en'>('sv')
  
  const urlParams = new URLSearchParams(window.location.search)
  const applyJobId = urlParams.get('apply')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    let { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (!data || error) {
       const { data: userData } = await supabase.auth.getUser()
       if (userData.user) {
         await supabase.from('profiles').upsert({ id: userId, email: userData.user.email, role: 'customer' })
         data = { role: 'customer' }
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
         <div className="h-screen flex items-center justify-center">Laddar...</div>
      ) : !session ? (
         <AuthScreen lang={lang} />
      ) : (
         <SimpleRouter role={role} session={session} lang={lang} />
      )}
    </>
  )
}