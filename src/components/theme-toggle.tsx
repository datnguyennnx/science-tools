'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { state: sidebarState, isMobile } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    const placeholderClasses = cn(
      'rounded-md border border-input bg-background',
      sidebarState === 'collapsed' && !isMobile ? 'size-8' : 'w-full h-10 px-3 py-2'
    )
    return (
      <div className={placeholderClasses} aria-busy="true" aria-live="polite">
        {/* Placeholder for theme select */}
      </div>
    )
  }

  if (sidebarState === 'collapsed' && !isMobile) {
    let Icon = Monitor
    if (theme === 'light') Icon = Sun
    if (theme === 'dark') Icon = Moon

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Current theme: ${theme || 'System'}`}>
            <Icon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 size-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 size-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className="mr-2 size-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Select value={theme ?? 'system'} onValueChange={setTheme}>
      <SelectTrigger aria-label={`Current theme: ${theme || 'System'}`} className="w-full">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">
          <Sun className="mr-2 size-4" />
          Light
        </SelectItem>
        <SelectItem value="dark">
          <Moon className="mr-2 size-4" />
          Dark
        </SelectItem>
        <SelectItem value="system">
          <Monitor className="mr-2 size-4" />
          System
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
