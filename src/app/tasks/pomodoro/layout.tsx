import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pomodoro Timer | Focus & Productivity',
  description: 'Stay focused and boost productivity with our customizable Pomodoro Timer',
}

interface PomodoroLayoutProps {
  children: ReactNode
}

export default function PomodoroLayout({ children }: PomodoroLayoutProps) {
  return <div className="w-full">{children}</div>
}
