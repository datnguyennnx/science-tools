'use client'

import { AlertTriangle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null

  return (
    <div className="flex items-center space-x-2 text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
      <AlertTriangle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  )
}
