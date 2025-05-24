import { useState, useCallback } from 'react'

/**
 * Custom hook for generating and managing text for typing tests
 */
export function useWordGenerator() {
  const [currentText, setCurrentText] = useState<string>('')

  // Generate Gen Z and American culture-focused text
  const generateRandomText = useCallback((): string => {
    // Gen Z subjects and characters
    const subjects = [
      'my bestie',
      'this tiktoker',
      'the influencer',
      'my roommate',
      'that streamer',
      'my crush',
      'the barista',
      'this content creator',
      'my coworker',
      'the cashier',
      'that girl',
      'my uber driver',
      'the delivery guy',
      'this random person',
      'my professor',
    ]

    const verbs = [
      'is totally',
      'literally just',
      'basically',
      'always',
      'never',
      'constantly',
      'definitely',
      'probably',
      'obviously',
      'actually',
      'genuinely',
      'straight up',
      'honestly',
      'seriously',
      'absolutely',
      'completely',
      'really',
      'truly',
    ]

    const actions = [
      'slaying',
      'vibing',
      'ghosting people',
      'procrastinating',
      'binge watching netflix',
      'scrolling tiktok',
      'ordering doordash',
      'complaining about gas prices',
      'avoiding responsibilities',
      'making spotify playlists',
      'texting their ex',
      'posting instagram stories',
      'having main character energy',
      'living their best life',
    ]

    const american_things = [
      'at target',
      'in their car',
      'at starbucks',
      'during lunch break',
      'at the gym',
      'in walmart',
      'at chipotle',
      'while driving',
      'at work',
      'in their apartment',
      'at the mall',
      'during class',
      'on the weekend',
      'after midnight',
      'before coffee',
    ]

    const gen_z_phrases = [
      'and its giving main character vibes',
      'but make it aesthetic',
      'no cap',
      'and thats on periodt',
      'its giving anxiety',
      'lowkey kinda sus',
      'but whatever i guess',
      'its literally so random',
      'and im here for it',
      'respectfully this aint it',
      'its giving me secondhand embarrassment',
      'periodt no printer',
      'and thats the tea',
      'its not giving what its supposed to give',
    ]

    const connectors = [
      'but like',
      'also',
      'meanwhile',
      'anyway',
      'so basically',
      'but wait',
      'oh and',
      'plus',
      'not to mention',
      'speaking of which',
      'on that note',
    ]

    const generateSentence = (): string => {
      const hasConnector = Math.random() < 0.4
      const hasPhrase = Math.random() < 0.6

      let sentence = subjects[Math.floor(Math.random() * subjects.length)]
      sentence += ' ' + verbs[Math.floor(Math.random() * verbs.length)]
      sentence += ' ' + actions[Math.floor(Math.random() * actions.length)]
      sentence += ' ' + american_things[Math.floor(Math.random() * american_things.length)]

      if (hasPhrase) {
        sentence += ' ' + gen_z_phrases[Math.floor(Math.random() * gen_z_phrases.length)]
      }

      if (hasConnector) {
        sentence += ' ' + connectors[Math.floor(Math.random() * connectors.length)]
        sentence += ' ' + subjects[Math.floor(Math.random() * subjects.length)]
        sentence += ' ' + verbs[Math.floor(Math.random() * verbs.length)]
        sentence += ' ' + actions[Math.floor(Math.random() * actions.length)]
      }

      return sentence
    }

    // Generate 2-3 sentences for authentic Gen Z rambling
    const sentenceCount = Math.floor(Math.random() * 2) + 2
    const sentences: string[] = []

    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence())
    }

    const rawText = sentences.join('. ')

    // Normalize the text:
    // 1. Convert to lowercase
    // 2. Remove all non-alphabetic characters (except spaces)
    // 3. Condense multiple spaces into single spaces
    // 4. Trim leading/trailing whitespace
    const normalizedText = rawText
      .toLowerCase()
      .replace(/[^a-z ]/g, '') // Keep only lowercase letters and spaces
      .replace(/\s+/g, ' ') // Condense multiple spaces to one
      .trim() // Remove leading/trailing spaces

    return normalizedText
  }, [])

  // Load a new random text
  const loadNewText = useCallback((): void => {
    const newText = generateRandomText()
    setCurrentText(newText)
  }, [generateRandomText])

  // Initialize with a random text if not already set
  const initialize = useCallback((): void => {
    if (!currentText) {
      loadNewText()
    }
  }, [currentText, loadNewText])

  return {
    currentText,
    loadNewText,
    initialize,
  }
}
