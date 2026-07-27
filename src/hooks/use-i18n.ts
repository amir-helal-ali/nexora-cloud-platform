'use client'

import { useEffect, useState, useMemo } from 'react'
import { useLanguage, type Locale } from '@/lib/language-store'

// Import messages statically — Next.js bundles them at build time
import arMessages from '@/i18n/messages/ar.json'
import enMessages from '@/i18n/messages/en.json'

const MESSAGES: Record<Locale, Record<string, any>> = {
  ar: arMessages,
  en: enMessages,
}

// Resolve a dotted path like "nav.overview" against a nested object
function get(obj: any, path: string): string {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) break
    cur = cur[p]
  }
  return typeof cur === 'string' ? cur : path
}

// Simple ICU-like {var} interpolation
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k]
    return v !== undefined ? String(v) : `{${k}}`
  })
}

export function useI18n() {
  const locale = useLanguage((s) => s.locale)
  const messages = MESSAGES[locale] || MESSAGES.en

  // Recreate `t` whenever messages change — no memoization issues with stale closures
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const tmpl = get(messages, key)
    return interpolate(tmpl, vars)
  }

  return { t, locale, messages }
}
