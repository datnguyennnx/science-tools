import { Timer as TimerIcon } from 'lucide-react'
import { ReactNode } from 'react'

const PomodoroTimerBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,transparent_5%,#000_50%,transparent_95%)]">
    {/* Concentric circles - behind the timer text */}
    <div className="absolute w-48 h-48 sm:w-60 md:w-72 border-[1.5px] border-[var(--primary)] rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
    <div className="absolute w-40 h-40 sm:w-52 md:w-64 border-[1px] border-[var(--primary)] rounded-full opacity-5 group-hover:opacity-15 transition-opacity duration-300" />

    <h1 className="relative text-6xl sm:text-8xl font-mono font-bold text-[var(--primary)] opacity-80 group-hover:opacity-100 transition-colors duration-300">
      25:00
    </h1>
  </div>
)

export const PomodoroTimerCard = {
  name: 'Pomodoro Timer',
  description: 'Boost focus with timed work and break intervals using the Pomodoro technique.',
  href: '/tasks/pomodoro',
  cta: 'Start Timer',
  Icon: TimerIcon,
  background: (<PomodoroTimerBackground />) as ReactNode,
  subFeatures: [
    'Customizable Work/Break Durations',
    'Session Counter',
    'Audio & Visual Notifications',
    'Productivity Stats',
  ],
}
