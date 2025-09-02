import { Keyboard as KeyboardIcon } from 'lucide-react'
import { ReactNode } from 'react'

const TypingTestBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6 opacity-40 group-hover:opacity-60 transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,transparent_20%,#000_50%,transparent_80%)]">
    <p className="font-mono text-sm sm:text-base text-center text-[var(--muted-foreground)] leading-relaxed scale-90 group-hover:scale-100 transition-transform duration-300">
      The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Lorem
      ipsum dolor sit amet...
      {/* Blinking cursor */}
      <span className="inline-block w-0.5 h-3 sm:h-4 translate-y-[2px] ml-0.5 bg-[var(--primary)] opacity-75 group-hover:opacity-100 animate-pulse"></span>
    </p>
  </div>
)

export const TypingTestCard = {
  name: 'Typing Test',
  description: 'Measure and enhance your typing speed and precision.',
  href: '/tasks/keyboard',
  cta: 'Start Typing',
  Icon: KeyboardIcon,
  background: (<TypingTestBackground />) as ReactNode,
  subFeatures: [
    'Words Per Minute (WPM) Tracking',
    'Accuracy Percentage',
    'Character & Error Count',
  ],
}
