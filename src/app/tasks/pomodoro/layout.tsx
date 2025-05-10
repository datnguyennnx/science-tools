import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description:
    'Stay focused and boost productivity with our customizable Pomodoro Timer. Optimize your work sessions with timed intervals.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'time management', 'work sessions'],
  openGraph: {
    title: 'Pomodoro Timer | Focus & Productivity',
    description: 'Stay focused and boost productivity with our customizable Pomodoro Timer',
    type: 'website',
  },
}

interface PomodoroLayoutProps {
  children: ReactNode
}

export default function PomodoroLayout({ children }: PomodoroLayoutProps) {
  return (
    <section aria-label="Pomodoro Timer Application" className="w-full">
      <div className="container mx-auto py-4">{children}</div>
    </section>
  )
}
