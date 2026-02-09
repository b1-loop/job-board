import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import KanbanBoard from '../components/KanbanBoard'

export default function JobKanban({ params, navigate, lang }: any) {
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
        supabase.from('jobs').select('*').eq('id', params.id).single()
        .then(({ data }) => setJob(data))
    }
  }, [params.id])

  if (!job) return <div className="h-screen flex items-center justify-center">Laddar jobb...</div>

  return (
    <div className="flex flex-col h-screen">
      <KanbanBoard 
        job={job} 
        goBack={() => navigate('dashboard')} 
        lang={lang} 
      />
    </div>
  )
}