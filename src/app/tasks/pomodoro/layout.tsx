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
    url: 'https://data-science.hallucinationguys.com/tasks/pomodoro',
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Timer | Focus & Productivity',
    description: 'Stay focused and boost productivity with our customizable Pomodoro Timer.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
