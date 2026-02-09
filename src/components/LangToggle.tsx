import React from 'react'

interface Props {
  lang: 'sv' | 'en'
  setLang: (l: 'sv' | 'en') => void
}

export default function LangToggle({ lang, setLang }: Props) {
  return (
    <button 
      onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
      className="fixed bottom-6 right-6 z-[9999] bg-white border border-slate-200 shadow-2xl px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 cursor-pointer active:scale-95 shadow-indigo-200/50"
    >
      <span>{lang === 'sv' ? '🇸🇪' : '🇺🇸'}</span>
      {lang === 'sv' ? 'Svenska' : 'English'}
    </button>
  )
}