import { useRef, useEffect } from 'react'
import { CharState } from '../engine/hooks/useTypingEngine'
import { CharacterSpan } from './CharacterSpan'

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

  // Auto-scroll to keep the current character in view
  useEffect(() => {
    if (testStatus === 'typing' && currentCharRef.current && containerRef.current) {
      const container = containerRef.current
      const currentChar = currentCharRef.current
      const containerRect = container.getBoundingClientRect()
      const currentCharRect = currentChar.getBoundingClientRect()

      // Check if current character is outside the visible area
      if (
        currentCharRect.top < containerRect.top ||
        currentCharRect.bottom > containerRect.bottom ||
        currentCharRect.left < containerRect.left ||
        currentCharRect.right > containerRect.right
      ) {
        // Scroll to position the current character in the middle of the container
        currentChar.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }
    }
  }, [currentIndex, testStatus])

  // Group characters into words for better rendering
  const renderWords = () => {
    const words: React.ReactElement[] = []
    let currentWord: React.ReactElement[] = []
    let wordIndex = 0

    charStates.forEach((charState, index) => {
      const isCurrentChar = index === currentIndex
      const characterSpan = (
        <span key={index} ref={isCurrentChar ? currentCharRef : undefined}>
          <CharacterSpan charState={charState} />
        </span>
      )

      if (charState.char === ' ') {
        // Add the current word and the space to the words array
        words.push(
          <span key={`word-${wordIndex}`} className="inline-block">
            {currentWord}
            {characterSpan}
          </span>
        )
        currentWord = []
        wordIndex++
      } else {
        currentWord.push(characterSpan)
      }
    })

    // Add the last word if it exists
    if (currentWord.length > 0) {
      words.push(
        <span key={`word-${wordIndex}`} className="inline-block">
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
        className="relative font-mono text-2xl sm:text-3xl rounded-lg overflow-auto focus:outline-none transition-colors flex items-center justify-center"
        tabIndex={0}
        role="textbox"
        aria-label="Type this text"
        aria-readonly="true"
      >
        <div className="leading-relaxed tracking-wide">{renderWords()}</div>
      </div>
    </div>
  )
}
