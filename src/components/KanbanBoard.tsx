import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { supabase } from '../supabaseClient'
import { translations } from '../translations'

export default function KanbanBoard({ job, goBack, role, lang }: { job: any, goBack: () => void, role: string, lang: 'sv'|'en' }) {
  const t = translations[lang]
  const [candidates, setCandidates] = useState<any[]>([])
  // HÄR FIXAR VI TYPESCRIPT FELET "TYPE NEVER"
  // Genom att initialisera med any[] eller tydlig struktur slipper vi felet.
  const [columns, setColumns] = useState<any>({
    new: { id: 'new', title: t.col_new, items: [] },
    interview: { id: 'interview', title: t.col_interview, items: [] },
    offer: { id: 'offer', title: t.col_offer, items: [] },
    hired: { id: 'hired', title: t.col_hired, items: [] }
  })
  const [selectedCand, setSelectedCand] = useState<any>(null)
  
  // Edit State
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    fetchCandidates()
  }, [job.id])

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*').eq('job_id', job.id)
    if (data) {
      setCandidates(data)
      distributeCandidates(data)
    }
  }

  function distributeCandidates(data: any[]) {
    // VIKTIGT: Definiera newCols som "any" för att undvika bråk med Typescript om tomma arrayer
    const newCols: any = {
        new: { id: 'new', title: t.col_new, items: [] },
        interview: { id: 'interview', title: t.col_interview, items: [] },
        offer: { id: 'offer', title: t.col_offer, items: [] },
        hired: { id: 'hired', title: t.col_hired, items: [] }
    }
    data.forEach(c => {
      if (newCols[c.status]) {
        newCols[c.status].items.push(c)
      } else {
        newCols['new'].items.push(c)
      }
    })
    setColumns(newCols)
  }

  async function onDragEnd(result: any) {
    if (!result.destination) return
    const { source, destination } = result

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId]
      const destCol = columns[destination.droppableId]
      const sourceItems = [...sourceCol.items]
      const destItems = [...destCol.items]
      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      })

      // Uppdatera status i databasen
      await supabase.from('candidates').update({ status: destination.droppableId }).eq('id', removed.id)
    } else {
      const col = columns[source.droppableId]
      const items = [...col.items]
      const [removed] = items.splice(source.index, 1)
      items.splice(destination.index, 0, removed)
      setColumns({ ...columns, [source.droppableId]: { ...col, items } })
    }
  }

  async function saveNotes() {
      if(!selectedCand) return
      const { error } = await supabase.from('candidates').update({ notes: editNotes }).eq('id', selectedCand.id)
      if(!error) {
          const updated = { ...selectedCand, notes: editNotes }
          setSelectedCand(updated)
          // Uppdatera listan i bakgrunden
          setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c))
          distributeCandidates(candidates.map(c => c.id === updated.id ? updated : c))
          alert(lang === 'sv' ? 'Sparat!' : 'Saved!')
      }
  }

  async function deleteCandidate() {
      if(!confirm(t.deleteCandidateConfirm)) return
      await supabase.from('candidates').delete().eq('id', selectedCand.id)
      setSelectedCand(null)
      fetchCandidates()
  }

  function emailCandidate(email: string, name: string) {
      const subject = `Angående din ansökan: ${job.title}`;
      const body = `Hej ${name},%0D%0A%0D%0ATack för din ansökan till tjänsten som ${job.title}.%0D%0A%0D%0A(Skriv ditt meddelande här...)`;
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
            <button onClick={goBack} className="text-slate-400 hover:text-slate-900 font-bold transition-colors">← {t.back}</button>
            <div>
                <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.location || 'Remote'} • {candidates.length} {t.statTotal}</p>
            </div>
        </div>
        <div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">{t.addCandidateBtn}</button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 h-full min-w-max">
            {Object.entries(columns).map(([id, col]: [string, any]) => (
              <div key={id} className="w-80 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{col.title}</h3>
                    <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-400 shadow-sm border border-slate-100">{col.items.length}</span>
                </div>
                <Droppable droppableId={id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-[24px] p-4 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 border-2 border-dashed border-indigo-200' : 'bg-slate-100/50 border-2 border-transparent'}`}
                    >
                      {col.items.map((item: any, index: number) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedCand(item); setEditNotes(item.notes || '') }}
                              className={`bg-white p-5 rounded-2xl shadow-sm mb-3 cursor-grab hover:shadow-md transition-all group border border-slate-100 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500/20' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                  {item.cv_url && <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100">PDF</span>}
                              </div>
                              <p className="text-xs text-slate-500 font-medium truncate mb-3">{item.email}</p>
                              
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); emailCandidate(item.email, item.name); }}
                                    className="p-1.5 hover:bg-slate-50 rounded-lg text-lg" title={t.emailCandidate}
                                  >
                                      ✉️
                                  </button>
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
        </DragDropContext>
      </div>

      {/* Candidate Modal */}
      {selectedCand && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-1">{selectedCand.name}</h2>
                        <a href={`mailto:${selectedCand.email}`} className="text-indigo-600 font-bold hover:underline">{selectedCand.email}</a>
                    </div>
                    <button onClick={() => setSelectedCand(null)} className="text-slate-300 hover:text-slate-900 text-2xl">✕</button>
                </div>

                <div className="space-y-8">
                    {/* Actions */}
                    <div className="flex gap-3 pb-8 border-b border-slate-100">
                        <button onClick={() => emailCandidate(selectedCand.email, selectedCand.name)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">✉️ {t.emailCandidate}</button>
                        {selectedCand.cv_url ? (
                            <a href={selectedCand.cv_url} target="_blank" className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold text-sm text-center hover:bg-indigo-100 transition-colors border border-indigo-100">📄 {t.cv}</a>
                        ) : <div className="flex-1 bg-slate-50 text-slate-300 py-3 rounded-xl font-bold text-sm text-center cursor-not-allowed">No CV</div>}
                        {selectedCand.linkedin_url && (
                            <a href={selectedCand.linkedin_url} target="_blank" className="w-12 flex items-center justify-center bg-[#0077b5]/10 text-[#0077b5] rounded-xl text-xl hover:bg-[#0077b5]/20 transition-colors">in</a>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{t.notes}</h3>
                        <textarea 
                            className="w-full h-40 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:bg-white focus:border-amber-300 outline-none font-medium text-slate-700 resize-none transition-all placeholder:text-amber-200"
                            placeholder={t.notesPlaceholder}
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                        />
                        <div className="flex justify-between mt-3">
                            <button onClick={deleteCandidate} className="text-red-400 font-bold text-xs hover:text-red-600 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">{t.deleteCandidateConfirm}</button>
                            <button onClick={saveNotes} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-slate-800 transition-all">{t.saveChanges}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}