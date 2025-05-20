'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme ?? ''} onValueChange={setTheme}>
      <SelectTrigger aria-label={`Current theme: ${theme}`} className="w-full">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">
          <Sun />
          Light
        </SelectItem>
        <SelectItem value="dark">
          <Moon />
          Dark
        </SelectItem>
        <SelectItem value="system">
          <Monitor />
          System
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
