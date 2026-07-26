'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'ar' | 'en'

interface LanguageState {
  locale: Locale
  setLocale: (l: Locale) => void
  toggle: () => void
  isRTL: () => boolean
  dir: () => 'rtl' | 'ltr'
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: 'ar', // Default to Arabic since the user explicitly requested Arabic support
      setLocale: (locale) => set({ locale }),
      toggle: () => set((s) => ({ locale: s.locale === 'ar' ? 'en' : 'ar' })),
      isRTL: () => get().locale === 'ar',
      dir: () => (get().locale === 'ar' ? 'rtl' : 'ltr'),
    }),
    {
      name: 'nexora-language',
      // Only persist the locale string
      partialize: (s) => ({ locale: s.locale }),
    }
  )
)

// Hook to read current direction (read-only, safe for render)
export function useDirection(): 'rtl' | 'ltr' {
  return useLanguage((s) => s.locale) === 'ar' ? 'rtl' : 'ltr'
}
