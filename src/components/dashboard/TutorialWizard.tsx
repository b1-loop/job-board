import React, { useState } from 'react'
import { translations } from '../../translations'

interface Props {
  onClose: () => void
  lang: 'sv' | 'en'
}

export default function TutorialWizard({ onClose, lang }: Props) {
  const t = translations[lang]
  const [step, setStep] = useState(1)
  const steps = [ 
    { id: 1, title: t.guideStep1Title, desc: t.guideStep1Desc, icon: '💼' }, 
    { id: 2, title: t.guideStep2Title, desc: t.guideStep2Desc, icon: '🔗' }, 
    { id: 3, title: t.guideStep3Title, desc: t.guideStep3Desc, icon: '⚡' }, 
    { id: 4, title: t.guideStep4Title, desc: t.guideStep4Desc, icon: '👥' }
  ]
  const cur = steps.find(s => s.id === step)

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col border border-white/50">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-lg font-bold">📚 {t.guide}</h2>
                <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-8 text-center flex flex-col items-center flex-1">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">{cur?.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{cur?.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{cur?.desc}</p>
            </div>
            <div className="flex justify-center gap-2 pb-6">
                {steps.map(s => (<div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${s.id === step ? 'bg-indigo-600 w-6' : 'bg-slate-200 w-2'}`}></div>))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className={`text-slate-400 font-bold text-xs uppercase ${step === 1 ? 'opacity-0' : ''}`}>{t.guidePrev}</button>
                <button onClick={() => step < 4 ? setStep(s => s + 1) : onClose()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">{step < 4 ? t.guideNext : t.guideDone}</button>
            </div>
        </div>
    </div>
  )
}