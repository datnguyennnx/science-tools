import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarkdownErrorProps } from '../engine/types'

export const MarkdownError = React.forwardRef<HTMLDivElement, MarkdownErrorProps>(
  ({ title, message, details, className, ...props }, ref) => {
    return (
      <Alert variant="destructive" className={cn('my-4', className)} ref={ref} {...props}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>{message}</p>
            {details && <p className="text-sm text-muted-foreground">{details}</p>}
          </div>
        </AlertDescription>
      </Alert>
    )
  }
)

MarkdownError.displayName = 'MarkdownError'
