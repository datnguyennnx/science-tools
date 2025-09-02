import { BooleanAlgebraCard } from './BooleanAlgebraCard'
import { JSONFormatterCard } from './JSONFormatterCard'
import { MarkdownPreviewerCard } from './MarkdownPreviewerCard'
import { TypingTestCard } from './TypingTestCard'
import { PomodoroTimerCard } from './PomodoroTimerCard'
import { SortVisualizerCard } from './SortVisualizerCard'
import { UrlPreviewCard } from './UrlPreviewCard'

export interface CardLayout {
  card: typeof BooleanAlgebraCard
  position: {
    row: number
    colStart: number
    colSpan: number
    responsive?: {
      md?: { colStart?: number; colSpan?: number }
      lg?: { colStart?: number; colSpan?: number }
    }
  }
}

export const layoutConfig: CardLayout[] = [
  {
    card: BooleanAlgebraCard,
    position: {
      row: 1,
      colStart: 1,
      colSpan: 1,
    },
  },
  {
    card: JSONFormatterCard,
    position: {
      row: 1,
      colStart: 2,
      colSpan: 1,
    },
  },
  {
    card: MarkdownPreviewerCard,
    position: {
      row: 1,
      colStart: 3,
      colSpan: 1,
    },
  },

  {
    card: PomodoroTimerCard,
    position: {
      row: 2,
      colStart: 1,
      colSpan: 1,
    },
  },

  {
    card: UrlPreviewCard,
    position: {
      row: 2,
      colStart: 1,
      colSpan: 1,
    },
  },

  {
    card: TypingTestCard,
    position: {
      row: 2,
      colStart: 3,
      colSpan: 1,
    },
  },

  // Row 3: Sort visualizer (full width)
  {
    card: SortVisualizerCard,
    position: {
      row: 3,
      colStart: 1,
      colSpan: 3,
    },
  },
]

// Helper function to get grid classes based on position
export const getGridClasses = (position: CardLayout['position']) => {
  const { colStart, colSpan, responsive } = position

  let classes = `col-start-${colStart} col-span-${colSpan}`

  if (responsive?.md) {
    const { colStart: mdStart, colSpan: mdSpan } = responsive.md
    if (mdStart) classes += ` md:col-start-${mdStart}`
    if (mdSpan) classes += ` md:col-span-${mdSpan}`
  }

  if (responsive?.lg) {
    const { colStart: lgStart, colSpan: lgSpan } = responsive.lg
    if (lgStart) classes += ` lg:col-start-${lgStart}`
    if (lgSpan) classes += ` lg:col-span-${lgSpan}`
  }

  return classes
}

// Export cards with their layout information
export const cardsWithLayout = layoutConfig.map(({ card, position }) => ({
  ...card,
  layoutClasses: getGridClasses(position),
  position,
}))

// Export just the card data for backward compatibility
export const cardComponents = layoutConfig.map(({ card }) => card)
