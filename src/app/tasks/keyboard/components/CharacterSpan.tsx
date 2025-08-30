import { CharState } from '../engine/hooks/useTypingEngine'
import { cn } from '@/lib/utils'

interface CharacterSpanProps {
  charState: CharState
}

// Renders individual character with status-based styling and GPU acceleration
export function CharacterSpan({ charState }: CharacterSpanProps) {
  const statusClasses = {
    untyped: 'text-muted-foreground/80',
    current: 'text-primary-foreground bg-primary rounded px-0.5',
    correct: 'text-[var(--keyboard-correct-text)]',
    incorrect:
      'text-[var(--keyboard-incorrect-text)] bg-[var(--keyboard-incorrect-bg)] dark:bg-[var(--keyboard-incorrect-bg-dark)] rounded',
  }

  return (
    <span
      className={cn(
        // GPU acceleration for smooth color transitions
        'relative font-mono transition-colors px-px transform-gpu will-change-auto',
        // Performance containment to isolate rendering
        'contain-style contain-layout contain-paint',
        statusClasses[charState.status]
      )}
      aria-current={charState.status === 'current' ? 'true' : undefined}
      style={{
        // Enable GPU acceleration for color changes
        willChange: charState.status === 'current' ? 'color, background-color' : 'auto',
      }}
    >
      {charState.char === ' ' ? '\u00A0' : charState.char}
    </span>
  )
}
