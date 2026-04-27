'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { kk } from '@/i18n/kk'
import { ru } from '@/i18n/ru'
import { en } from '@/i18n/en'

export type LangCode = 'kk' | 'ru' | 'en'
export type Translations = typeof ru

const TRANSLATIONS: Record<LangCode, Translations> = { kk, ru, en }

interface LangContextType {
  lang: LangCode
  t: Translations
  setLang: (lang: LangCode) => void
}

const LangContext = createContext<LangContextType>({
  lang: 'ru',
  t: ru,
  setLang: () => {},
})

export function useLang() {
  return useContext(LangContext)
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('ru')

  useEffect(() => {
    const saved = localStorage.getItem('bilim-lang') as LangCode | null
    if (saved && ['kk', 'ru', 'en'].includes(saved)) {
      setLangState(saved)
      document.documentElement.setAttribute('lang', saved)
    }
  }, [])

  function setLang(code: LangCode) {
    setLangState(code)
    localStorage.setItem('bilim-lang', code)
    document.documentElement.setAttribute('lang', code)
  }

  return (
    <LangContext.Provider value={{ lang, t: TRANSLATIONS[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}
