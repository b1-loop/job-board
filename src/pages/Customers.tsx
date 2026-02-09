import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar' // Navbar här också
import CustomersView from '../components/dashboard/CustomersView'

export default function Customers({ role, session, lang, navigate }: any) {
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    if (role === 'admin') fetchCustomers()
  }, [role])

  async function fetchCustomers() { 
    const { data } = await supabase.from('profiles').select('*')
    setCustomers(data || []) 
  }

  async function deleteCustomer(id: string) {
    if (!confirm('Är du säker?')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchCustomers()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
       <Navbar role={role} session={session} navigate={navigate} setShowTutorial={() => {}} openProfile={() => {}} lang={lang} />
       <CustomersView customers={customers} onDelete={deleteCustomer} lang={lang} />
    </div>
  )
}