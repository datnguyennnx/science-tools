import { CharState } from '../engine/hooks/useTypingEngine'
import { cn } from '@/lib/utils'

interface CharacterSpanProps {
  charState: CharState
}

/**
 * Component to render a single character with styling based on its status
 */
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
      className={cn('relative font-mono transition-colors px-px', statusClasses[charState.status])}
      aria-current={charState.status === 'current' ? 'true' : undefined}
    >
      {charState.char === ' ' ? '\u00A0' : charState.char}
    </span>
  )
}
