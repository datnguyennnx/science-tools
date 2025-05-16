import React from 'react'
import { cn } from '@/lib/utils'

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ children, className, ...props }: KbdProps): React.JSX.Element {
  return (
    <kbd
      className={cn(
        'pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:opacity-80',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
