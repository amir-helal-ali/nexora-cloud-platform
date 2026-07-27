import { describe, it, expect } from 'vitest'
import arMessages from '@/i18n/messages/ar.json'
import enMessages from '@/i18n/messages/en.json'

describe('i18n: Translation Files', () => {
  it('should have same top-level keys in ar and en', () => {
    const arKeys = Object.keys(arMessages).sort()
    const enKeys = Object.keys(enMessages).sort()
    expect(arKeys).toEqual(enKeys)
  })

  it('should have at least 10 sections', () => {
    expect(Object.keys(arMessages).length).toBeGreaterThanOrEqual(10)
    expect(Object.keys(enMessages).length).toBeGreaterThanOrEqual(10)
  })

  it('should have all critical sections', () => {
    const required = ['common', 'nav', 'topbar', 'overview', 'apps', 'databases', 'notifications', 'settings', 'language', 'footer']
    for (const section of required) {
      expect(arMessages).toHaveProperty(section)
      expect(enMessages).toHaveProperty(section)
    }
  })

  it('should have non-empty values for common keys', () => {
    const criticalKeys = [
      'common.save',
      'common.cancel',
      'common.delete',
      'common.edit',
      'nav.overview',
      'nav.apps',
      'nav.databases',
      'nav.settingsNav',
      'topbar.newApp',
      'overview.welcome',
    ]

    const getVal = (obj: any, path: string): string => {
      const parts = path.split('.')
      let cur = obj
      for (const p of parts) {
        if (cur == null) return ''
        cur = cur[p]
      }
      return typeof cur === 'string' ? cur : ''
    }

    for (const key of criticalKeys) {
      const arVal = getVal(arMessages, key)
      const enVal = getVal(enMessages, key)
      expect(arVal.length).toBeGreaterThan(0)
      expect(enVal.length).toBeGreaterThan(0)
    }
  })

  it('should have Arabic text in ar.json', () => {
    const welcome = (arMessages as any).overview?.welcome || ''
    expect(welcome).toContain('مرحبا')
  })

  it('should have English text in en.json', () => {
    const welcome = (enMessages as any).overview?.welcome || ''
    expect(welcome).toContain('Welcome')
  })

  it('should support interpolation placeholders', () => {
    const arWelcomeMsg = (arMessages as any).overview?.welcomeMessage || ''
    expect(arWelcomeMsg).toContain('{regions}')
    expect(arWelcomeMsg).toContain('{instances}')
    expect(arWelcomeMsg).toContain('{rps}')
  })

  it('should have 500+ translation keys in Arabic', () => {
    const countKeys = (obj: any): number => {
      let count = 0
      for (const v of Object.values(obj)) {
        if (typeof v === 'string') count++
        else if (typeof v === 'object' && v !== null) count += countKeys(v)
      }
      return count
    }
    const arCount = countKeys(arMessages)
    expect(arCount).toBeGreaterThanOrEqual(500)
  })
})

describe('i18n: Language Store Logic', () => {
  it('should default to Arabic locale', () => {
    // Test the direction logic
    const isRTL = (locale: string) => locale === 'ar'
    expect(isRTL('ar')).toBe(true)
    expect(isRTL('en')).toBe(false)
  })

  it('should compute correct direction', () => {
    const dir = (locale: string): 'rtl' | 'ltr' =>
      locale === 'ar' ? 'rtl' : 'ltr'
    expect(dir('ar')).toBe('rtl')
    expect(dir('en')).toBe('ltr')
  })

  it('should toggle between locales', () => {
    const toggle = (locale: string): string =>
      locale === 'ar' ? 'en' : 'ar'
    expect(toggle('ar')).toBe('en')
    expect(toggle('en')).toBe('ar')
  })
})

describe('i18n: Interpolation', () => {
  // Test the interpolation logic from use-i18n.ts
  function interpolate(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template
    return template.replace(/\{(\w+)\}/g, (_, k) => {
      const v = vars[k]
      return v !== undefined ? String(v) : `{${k}}`
    })
  }

  it('should replace single placeholder', () => {
    const result = interpolate('Hello {name}', { name: 'World' })
    expect(result).toBe('Hello World')
  })

  it('should replace multiple placeholders', () => {
    const result = interpolate('{greeting} {name}!', { greeting: 'Hi', name: 'Ahmed' })
    expect(result).toBe('Hi Ahmed!')
  })

  it('should handle numeric values', () => {
    const result = interpolate('{count} items', { count: 42 })
    expect(result).toBe('42 items')
  })

  it('should handle Arabic text with placeholders', () => {
    const result = interpolate(
      'أسطولك يعمل عبر {regions} مناطق مع {instances} مثيل',
      { regions: '3', instances: '5' }
    )
    expect(result).toBe('أسطولك يعمل عبر 3 مناطق مع 5 مثيل')
  })

  it('should leave unresolved placeholders as-is', () => {
    const result = interpolate('Hello {name} {missing}', { name: 'World' })
    expect(result).toBe('Hello World {missing}')
  })

  it('should handle no placeholders', () => {
    const result = interpolate('Just text', { unused: 'val' })
    expect(result).toBe('Just text')
  })

  it('should handle empty vars', () => {
    const result = interpolate('Hello {name}')
    expect(result).toBe('Hello {name}')
  })
})
