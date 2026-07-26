'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/language-store'
import { useI18n } from '@/hooks/use-i18n'
import { Badge } from '@/components/ui/badge'
import { Languages, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()

  const handleSetLocale = (l: 'ar' | 'en') => {
    if (l === locale) return
    setLocale(l)
    toast.success(l === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English', {
      duration: 2000,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-foreground transition-colors hover:bg-accent"
          aria-label={t('language.toggle')}
          title={t('language.toggle')}
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-medium">{locale === 'ar' ? 'ع' : 'EN'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => handleSetLocale('ar')}
          className={cn('gap-2', locale === 'ar' && 'bg-accent')}
        >
          <span className="text-base">🇪🇬</span>
          <span className="flex-1">العربية</span>
          {locale === 'ar' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetLocale('en')}
          className={cn('gap-2', locale === 'en' && 'bg-accent')}
        >
          <span className="text-base">🇬🇧</span>
          <span className="flex-1">English</span>
          {locale === 'en' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
