import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import JobKanban from './pages/JobKanban'
import Customers from './pages/Customers'

const PAGES: any = {
  dashboard: Dashboard,
  job: JobKanban,
  customers: Customers
}

export default function SimpleRouter({ role, session, lang }: any) {
  // 1. Läs av URL vid start
  const getParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      page: params.get('page') || 'dashboard',
      id: params.get('id')
    }
  }

  const [currentPage, setCurrentPage] = useState(getParams().page)
  const [params, setParams] = useState<any>({ id: getParams().id })

  // 2. Lyssna på webbläsarens bakåt/framåt-knappar
  useEffect(() => {
    const handlePopState = () => {
      const p = getParams()
      setCurrentPage(p.page)
      setParams({ id: p.id })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 3. Funktion för att byta sida (uppdaterar URL utan omladdning)
  const navigate = (pageName: string, newParams: any = {}) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', pageName)
    
    if (newParams.id) url.searchParams.set('id', newParams.id)
    else url.searchParams.delete('id')
    
    window.history.pushState({}, '', url)
    setCurrentPage(pageName)
    setParams(newParams)
  }

  // 4. Rendera vald sida
  const PageComponent = PAGES[currentPage] || Dashboard

  return (
    <PageComponent 
      role={role} 
      session={session} 
      lang={lang} 
      params={params} // Skickar med ID (t.ex. jobb-id)
      navigate={navigate} // Skickar med funktionen för att byta sida
    />
  )
}