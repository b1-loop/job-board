import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { translations } from '../translations'

interface Candidate {
  id: number
  name: string
  email: string
  linkedin_url: string
  notes: string
  cv_url: string
  status: string
  job_id: number
  created_at: string
}

interface Props {
  job: any
  goBack: () => void
  lang: 'sv' | 'en'
}

export default function KanbanBoard({ job, goBack, lang }: Props) {
  const t = translations[lang]

  const COLUMNS = {
    new: { title: t.col_new, color: 'border-blue-500' },
    interview: { title: t.col_interview, color: 'border-yellow-500' },
    offer: { title: t.col_offer, color: 'border-purple-500' },
    hired: { title: t.col_hired, color: 'border-green-500' }
  }

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [uploading, setUploading] = useState(false)
  const [candName, setCandName] = useState('')
  const [candEmail, setCandEmail] = useState('')
  const [candLink, setCandLink] = useState('')

  useEffect(() => { if (job) fetchCandidates() }, [job])

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*').eq('job_id', job.id).order('created_at', { ascending: false })
    setCandidates(data || [])
  }

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('candidates').insert([{ name: candName, email: candEmail, linkedin_url: candLink, job_id: job.id, status: 'new' }])
    setCandName(''); setCandEmail(''); setCandLink(''); setIsFormOpen(false)
    fetchCandidates()
  }
  
  async function deleteCandidate(candidateId: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(t.deleteCandidateConfirm)) return
    if (selectedCandidate?.id === candidateId) setSelectedCandidate(null)
    setCandidates(prev => prev.filter(c => c.id !== candidateId))
    await supabase.from('candidates').delete().eq('id', candidateId)
  }

  async function onDragEnd(result: DropResult) {
     const { destination, source, draggableId } = result
     if (!destination) return
     if (destination.droppableId === source.droppableId && destination.index === source.index) return
     const newStatus = destination.droppableId
     const cId = parseInt(draggableId)
     setCandidates(prev => prev.map(c => c.id === cId ? { ...c, status: newStatus } : c))
     await supabase.from('candidates').update({ status: newStatus }).eq('id', cId)
  }

  async function uploadCV(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !selectedCandidate) return
    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${selectedCandidate.id}/${fileName}`
    const { error: uploadError } = await supabase.storage.from('cvs').upload(filePath, file)
    if (uploadError) { alert('Error: ' + uploadError.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filePath)
    await supabase.from('candidates').update({ cv_url: publicUrl }).eq('id', selectedCandidate.id)
    const updated = { ...selectedCandidate, cv_url: publicUrl }
    setSelectedCandidate(updated)
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c))
    setUploading(false)
  }

  async function saveCandidateChanges() {
    if (!selectedCandidate) return
    await supabase.from('candidates').update({ 
        notes: selectedCandidate.notes, name: selectedCandidate.name, email: selectedCandidate.email, linkedin_url: selectedCandidate.linkedin_url
    }).eq('id', selectedCandidate.id)
    setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? selectedCandidate : c))
    alert(t.save)
  }

  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  function formatDate(isoString: string) {
    if (!isoString) return ''
    return new Date(isoString).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gray-100 flex flex-col relative">
        {selectedCandidate && (
            <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
                <div className="w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto animate-fade-in-right">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{t.profile}</h2>
                        <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-black text-2xl">✕</button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.name}</label>
                            <input className="w-full p-2 border rounded font-medium" value={selectedCandidate.name} onChange={e => setSelectedCandidate({...selectedCandidate, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.email}</label>
                            <input className="w-full p-2 border rounded" value={selectedCandidate.email} onChange={e => setSelectedCandidate({...selectedCandidate, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn</label>
                            <input className="w-full p-2 border rounded" value={selectedCandidate.linkedin_url || ''} onChange={e => setSelectedCandidate({...selectedCandidate, linkedin_url: e.target.value})} placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.notes}</label>
                            <textarea className="w-full p-3 border rounded h-32 text-sm leading-relaxed bg-yellow-50 focus:bg-white transition" placeholder={t.notesPlaceholder} value={selectedCandidate.notes || ''} onChange={e => setSelectedCandidate({...selectedCandidate, notes: e.target.value})} />
                        </div>
                        <div className="border-t pt-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.cv}</label>
                            {selectedCandidate.cv_url ? (
                                <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                                    <span className="text-sm text-blue-800 font-medium">{t.cvUploaded}</span>
                                    <a href={selectedCandidate.cv_url} target="_blank" rel="noreferrer" className="text-xs bg-white border px-3 py-1 rounded hover:bg-gray-50">Öppna</a>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer relative bg-gray-50">
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={uploadCV} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <p className="text-gray-500 text-sm">{uploading ? '...' : t.cvUpload}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={saveCandidateChanges} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 mt-4">{t.saveChanges}</button>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="text-gray-500 hover:text-black font-medium transition">← {t.back}</button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <input className="border p-2 rounded-lg bg-gray-50 w-64 focus:bg-white outline-none" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition font-medium">{isFormOpen ? t.close : t.addCandidateBtn}</button>
          </div>
        </div>

        {isFormOpen && (
          <div className="bg-blue-50 p-6 border-b border-blue-100 animate-fade-in">
            <form onSubmit={addCandidate} className="max-w-4xl mx-auto flex gap-4 items-end">
              <input required className="flex-1 p-2 rounded border" value={candName} onChange={e => setCandName(e.target.value)} placeholder={t.name} />
              <input className="flex-1 p-2 rounded border" value={candEmail} onChange={e => setCandEmail(e.target.value)} placeholder={t.email} />
              <button className="bg-green-600 text-white px-6 py-2 rounded h-10 hover:bg-green-700 font-medium">{t.save}</button>
            </form>
          </div>
        )}

        <div className="flex-1 p-8 overflow-x-auto">
            <div className="flex gap-6 min-w-[1000px] h-full">
            {Object.entries(COLUMNS).map(([columnId, column]) => (
              <div key={columnId} className={`flex-1 min-w-[250px] bg-gray-100 flex flex-col h-full`}>
                <h3 className={`font-bold text-gray-700 mb-4 pb-2 border-b-4 ${column.color} flex justify-between`}>
                  {column.title}
                  <span className="bg-white px-2 rounded text-sm text-gray-500 shadow-sm">{filteredCandidates.filter(c => c.status === columnId).length}</span>
                </h3>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 rounded-xl p-2 transition ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-100' : ''}`}>
                      {filteredCandidates.filter(c => c.status === columnId).map((candidate, index) => (
                          <Draggable key={candidate.id} draggableId={candidate.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setSelectedCandidate(candidate)} className={`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition cursor-pointer active:cursor-grabbing relative hover:border-blue-400 ${snapshot.isDragging ? 'rotate-2 shadow-xl scale-105' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{candidate.name}</p>
                                        <div className="text-[10px] text-gray-400 mt-1">🕒 {formatDate(candidate.created_at)}</div>
                                    </div>
                                    <button onClick={(e) => deleteCandidate(candidate.id, e)} className="text-gray-300 hover:text-red-600 transition p-1 hover:bg-red-50 rounded">🗑️</button>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {candidate.notes && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">📝</span>}
                                    {candidate.cv_url && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">📄</span>}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
            </div>
        </div>
      </div>
    </DragDropContext>
  )
}