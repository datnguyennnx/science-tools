'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { state: sidebarState, isMobile } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const getCurrentIcon = () => {
    return theme === 'light' ? Sun : Moon
  }

  const getCurrentLabel = () => {
    return theme === 'light' ? 'Light' : 'Dark'
  }

  if (!mounted) {
    const placeholderClasses = cn(
      'rounded-md border border-input bg-background',
      sidebarState === 'collapsed' && !isMobile ? 'size-8' : 'w-full h-10'
    )
    return (
      <div className={placeholderClasses} aria-busy="true" aria-live="polite">
        {/* Placeholder for theme toggle */}
      </div>
    )
  }

  const Icon = getCurrentIcon()
  const isCollapsed = sidebarState === 'collapsed' && !isMobile

  return (
    <Button
      variant="ghost"
      size={isCollapsed ? 'icon' : 'default'}
      onClick={toggleTheme}
      className={cn(isCollapsed ? 'size-8' : 'w-full justify-start')}
      aria-label={`Current theme: ${getCurrentLabel()}. Click to toggle theme.`}
    >
      <Icon className={cn('size-4', !isCollapsed && 'mr-2')} />
      {!isCollapsed && getCurrentLabel()}
    </Button>
  )
}
