'use client'

import { useEffect, type ReactNode } from 'react'
import { useLanguage } from '@/lib/language-store'

/**
 * DirectionProvider
 *
 * 1. On mount, manually rehydrates the persisted language preference
 *    (we use `skipHydration: true` in the store to avoid SSR mismatch).
 * 2. Applies the correct `dir` and `lang` attributes to <html> based on the
 *    persisted language preference.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  const locale = useLanguage((s) => s.locale)

  // Manually rehydrate the persisted state on the client only.
  // This runs once after mount, so SSR HTML (which uses 'ar' default)
  // matches the first client render (also 'ar' default).
  useEffect(() => {
    // `useLanguage.persist.rehydrate()` is added by zustand persist middleware
    const api = useLanguage as any
    if (api?.persist?.rehydrate) {
      api.persist.rehydrate()
    }
  }, [])

  // Apply dir/lang to <html> whenever locale changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    html.lang = locale
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
    html.dataset.locale = locale
  }, [locale])

  return <>{children}</>
}
