'use client'

import { useEffect, useState, ReactNode } from 'react'
// import { Sparkles } from 'lucide-react' // No longer needed as default
import { motion, AnimatePresence } from 'framer-motion'

interface FullscreenFlashMessageProps {
  /** Changes to show the message; typically an incrementing number. */
  trigger: number
  /** The message to display. Defaults to "God bless you!!". */
  message?: string
  /** The icon to display. Can be a ReactNode. Defaults to a large Sparkles icon. */
  icon?: ReactNode // Can be an emoji string or any ReactNode
  /** Duration in milliseconds for the message to be visible. Defaults to 2000ms. */
  duration?: number
}

const DEFAULT_MESSAGE = 'God bless you!!'
// Updated to emoji, with a large text size class for styling
const DEFAULT_ICON_NODE = <span className="text-[20rem]">🙏</span>
const DEFAULT_DURATION = 2000

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut', delay: 0.3 } },
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -15,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
}

// Subtle breathing animation for the icon
const iconBreatheAnimation = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 3,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
}

/**
 * A component that displays a fullscreen message with a transparent background
 * for a short duration when triggered.
 */
export const FullscreenFlashMessage = ({
  trigger,
  message = DEFAULT_MESSAGE,
  icon = DEFAULT_ICON_NODE,
  duration = DEFAULT_DURATION,
}: FullscreenFlashMessageProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayMessage, setDisplayMessage] = useState(message)
  const [displayIcon, setDisplayIcon] = useState(icon)

  useEffect(() => {
    // Only trigger if the trigger value is positive and has actually changed instance.
    // This effect runs when trigger changes.
    if (trigger > 0) {
      setDisplayMessage(message) // Capture the message associated with this trigger
      // If the icon prop changes, update the displayIcon.
      // This allows overriding the default emoji if a different icon is passed.
      setDisplayIcon(icon)
      setIsVisible(true)
    }
  }, [trigger, message, icon]) // Depend on message and icon if they can change per trigger

  useEffect(() => {
    // This effect runs when isVisible becomes true.
    let timerId: NodeJS.Timeout | null = null
    if (isVisible) {
      timerId = setTimeout(() => {
        setIsVisible(false)
      }, duration)
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId)
      }
    }
  }, [isVisible, duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div animate={iconBreatheAnimation}>{displayIcon}</motion.div>
            <motion.p
              className="mt-4 text-[10rem] font-bold text-white"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
            >
              {displayMessage}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
