import React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, XCircle, Info } from 'lucide-react'

interface JsonErrorProps {
  title: string
  message: string
  details?: string
  className?: string
  type?: 'error' | 'warning' | 'info'
}

export function JsonError({ title, message, details, className, type = 'error' }: JsonErrorProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getContainerStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      default:
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    }
  }

  const getTitleStyles = () => {
    switch (type) {
      case 'warning':
        return 'text-amber-900 dark:text-amber-100'
      case 'info':
        return 'text-blue-900 dark:text-blue-100'
      default:
        return 'text-red-900 dark:text-red-100'
    }
  }

  return (
    <div className={cn('p-4 rounded-md border', getContainerStyles(), className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold mb-2', getTitleStyles())}>{title}</h4>

          <div className="text-sm">
            <p className="mb-2">{message}</p>

            {details && (
              <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border border-current/20">
                <p className="text-xs font-mono">{details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
