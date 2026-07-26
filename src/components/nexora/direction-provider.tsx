'use client'

import { useEffect, type ReactNode } from 'react'
import { useLanguage } from '@/lib/language-store'

/**
 * DirectionProvider
 * Applies the correct `dir` and `lang` attributes to <html> based on the
 * persisted language preference. Runs once on mount and again whenever the
 * locale changes.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  const locale = useLanguage((s) => s.locale)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    html.lang = locale
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
    // Helpful for debugging and CSS targeting
    html.dataset.locale = locale
  }, [locale])

  return <>{children}</>
}
