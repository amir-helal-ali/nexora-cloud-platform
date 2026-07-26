'use client'

import { useEffect, useState } from 'react'
import { useLanguage, type Locale } from '@/lib/language-store'

// Cache of loaded message bundles
const messageCache: Partial<Record<Locale, Record<string, any>>> = {}

async function loadMessages(locale: Locale): Promise<Record<string, any>> {
  if (messageCache[locale]) return messageCache[locale]!
  try {
    const mod = await import(`@/i18n/messages/${locale}.json`)
    messageCache[locale] = mod.default || mod
    return messageCache[locale]!
  } catch (e) {
    console.error(`Failed to load messages for ${locale}`, e)
    return {}
  }
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
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

export function useI18n() {
  const locale = useLanguage((s) => s.locale)
  const [messages, setMessages] = useState<Record<string, any>>(messageCache[locale] || {})

  useEffect(() => {
    let cancelled = false
    loadMessages(locale).then((m) => {
      if (!cancelled) setMessages(m)
    })
    return () => { cancelled = true }
  }, [locale])

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const tmpl = get(messages, key)
    return interpolate(tmpl, vars)
  }

  return { t, locale, messages }
}
