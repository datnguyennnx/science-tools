import { useRef, useEffect } from 'react'
import { CharState } from '../engine/hooks/useTypingEngine'
import { CharacterSpan } from './CharacterSpan'
import { cn } from '@/lib/utils'

interface TextDisplayProps {
  charStates: CharState[]
  currentIndex: number
  testStatus: 'pending' | 'typing' | 'finished'
}

/**
 * Component to display the text to be typed with appropriate styling
 */
export function TextDisplay({ charStates, currentIndex, testStatus }: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCharRef = useRef<HTMLSpanElement>(null)
  const scrollAnimationFrameRef = useRef<number | null>(null)

  // Optimized smooth scrolling with GPU acceleration for better performance during rapid typing
  const smoothScrollToCurrentChar = () => {
    if (!currentCharRef.current || !containerRef.current) return

    const container = containerRef.current
    const currentChar = currentCharRef.current
    const containerRect = container.getBoundingClientRect()
    const currentCharRect = currentChar.getBoundingClientRect()

    // Check if current character is outside the visible area with smaller threshold for smoother scrolling
    const threshold = 20 // pixels
    if (
      currentCharRect.top < containerRect.top + threshold ||
      currentCharRect.bottom > containerRect.bottom - threshold ||
      currentCharRect.left < containerRect.left + threshold ||
      currentCharRect.right > containerRect.right - threshold
    ) {
      // Cancel any existing animation frame
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current)
      }

      // Use requestAnimationFrame for smooth scrolling with GPU acceleration
      scrollAnimationFrameRef.current = requestAnimationFrame(() => {
        currentChar.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
        scrollAnimationFrameRef.current = null
      })
    }
  }

  // Auto-scroll to keep the current character in view with frame-based optimization
  useEffect(() => {
    if (testStatus === 'typing') {
      // Use requestAnimationFrame to throttle scrolling during rapid typing
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current)
      }

      scrollAnimationFrameRef.current = requestAnimationFrame(smoothScrollToCurrentChar)
    }

    return () => {
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current)
      }
    }
  }, [currentIndex, testStatus])

  // Optimized rendering text grouped by words for better readability and performance
  const renderWords = () => {
    const words: React.ReactElement[] = []
    let currentWord: React.ReactElement[] = []
    let wordIndex = 0
    let charCounter = 0

    charStates.forEach(charState => {
      const isCurrentChar = charCounter === currentIndex
      const characterSpan = (
        <span
          key={`${charState.char}-${charCounter}`}
          ref={isCurrentChar ? currentCharRef : undefined}
          className={cn(
            // GPU acceleration for individual character containers
            'transform-gpu',
            // Performance containment for each character
            'contain-style contain-layout contain-paint'
          )}
        >
          <CharacterSpan charState={charState} />
        </span>
      )

      if (charState.char === ' ') {
        // Add the current word and the space to the words array
        words.push(
          <span
            key={`word-${wordIndex}`}
            className={cn(
              'inline-block',
              // GPU acceleration for word containers
              'transform-gpu',
              // Performance containment for word-level rendering
              'contain-layout contain-paint'
            )}
          >
            {currentWord}
            {characterSpan}
          </span>
        )
        currentWord = []
        wordIndex++
      } else {
        currentWord.push(characterSpan)
      }
      charCounter++
    })

    // Add the last word if it exists
    if (currentWord.length > 0) {
      words.push(
        <span
          key={`word-${wordIndex}`}
          className={cn(
            'inline-block',
            // GPU acceleration for word containers
            'transform-gpu',
            // Performance containment for word-level rendering
            'contain-layout contain-paint'
          )}
        >
          {currentWord}
        </span>
      )
    }

    return words
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={cn(
          // GPU acceleration for smooth scrolling
          'relative font-mono text-2xl sm:text-3xl rounded-lg overflow-auto focus:outline-none',
          'transition-colors flex items-center justify-center transform-gpu',
          // Performance containment to isolate rendering and scrolling
          'contain-layout contain-paint',
          // Optimize scrolling performance
          'scroll-smooth will-change-scroll'
        )}
        tabIndex={0}
        role="textbox"
        aria-label="Type this text"
        aria-readonly="true"
        style={{
          // Enable GPU acceleration for scroll operations
          willChange: testStatus === 'typing' ? 'scroll-position' : 'auto',
        }}
      >
        <div
          className={cn(
            'leading-relaxed tracking-wide',
            // GPU acceleration for text rendering
            'transform-gpu',
            // Performance containment for text layout
            'contain-style contain-layout'
          )}
        >
          {renderWords()}
        </div>
      </div>
    </div>
  )
}
