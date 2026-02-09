import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LangToggle from './components/LangToggle'
import ApplyPage from './components/ApplyPage'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'

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
    // 1. Försök hämta rollen från databasen först
    let { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // 2. Om profilen inte finns (första gången användaren loggar in)
    if (!data || error) {
       const { data: userData } = await supabase.auth.getUser()
       
       if (userData.user) {
         // Skapa en ny profil som 'customer' som standard
         // OBS: Om du vill att någon ska vara admin måste du ändra det manuellt i Supabase Dashboard
         const { error: insertError } = await supabase
           .from('profiles')
           .upsert({ 
             id: userId, 
             email: userData.user.email, 
             role: 'customer' 
           })
         
         if (!insertError) {
           data = { role: 'customer' }
         }
       }
    }

    // 3. Sätt rollen baserat på vad databasen sa (eller vad vi nyss skapade)
    if (data && data.role) {
      setRole(data.role)
    }
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