'use client'

import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid'
import {
  Calculator,
  BarChartHorizontalBig,
  Keyboard as KeyboardIcon,
  Timer as TimerIcon,
  Lightbulb,
  FileText,
} from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const BooleanAlgebraBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 opacity-40 group-hover:opacity-60 transition-all duration-500 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]">
    <div className="relative w-2/3 h-2/3 max-w-xs max-h-xs">
      {/* K-Map Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-1 w-full h-full">
        {[
          {
            val: '00',
            r: 0,
            c: 0,
            base: 'bg-[var(--kmap-group-single)] opacity-60', // Increased opacity
            hover: 'opacity-80', // Increased opacity
          },
          {
            val: '01',
            r: 0,
            c: 1,
            base: 'bg-[var(--kmap-group-pair)] opacity-70', // Increased opacity
            hover: 'opacity-90', // Increased opacity
          },
          {
            val: '11',
            r: 0,
            c: 2,
            base: 'bg-[var(--kmap-group-pair)] opacity-70', // Increased opacity
            hover: 'opacity-90', // Increased opacity
          },
          {
            val: '10',
            r: 0,
            c: 3,
            base: 'bg-[var(--kmap-group-quad)] opacity-60', // Increased opacity
            hover: 'opacity-80', // Increased opacity
          },
          {
            val: '0',
            r: 1,
            c: 0,
            base: 'bg-[var(--kmap-group-single)] opacity-60', // Increased opacity
            hover: 'opacity-80', // Increased opacity
          },
          {
            val: '1',
            r: 1,
            c: 1,
            base: 'bg-[var(--kmap-group-pair)] opacity-70', // Increased opacity
            hover: 'opacity-90', // Increased opacity
          },
          {
            val: '1',
            r: 1,
            c: 2,
            base: 'bg-[var(--kmap-group-pair)] opacity-70', // Increased opacity
            hover: 'opacity-90', // Increased opacity
          },
          {
            val: '0',
            r: 1,
            c: 3,
            base: 'bg-[var(--kmap-group-quad)] opacity-60', // Increased opacity
            hover: 'opacity-80', // Increased opacity
          },
        ].map(cell => (
          <span
            key={`${cell.r}-${cell.c}`}
            className={cn(
              'border-[var(--border)] dark:border-[var(--border-dark)] opacity-80 dark:opacity-60 rounded-sm flex items-center justify-center text-xs font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]',
              cell.base, // Base opacity applied here
              `group-hover:${cell.hover}`, // Hover opacity applied on group hover
              'transition-all duration-300'
            )}
          >
            {cell.val}
          </span>
        ))}
      </div>
      {/* Simplified Path/Grouping Highlight on hover */}
      <div className="absolute top-[calc(25%-1px)] left-[calc(25%+1px)] w-[calc(50%-2px)] h-[calc(50%-2px)] border-2 border-transparent group-hover:border-[var(--kmap-group-octet)] rounded-md transition-all duration-300 opacity-0 group-hover:opacity-100" />
    </div>
  </div>
)

const SortVisualizerBackground = () => (
  <div className="absolute inset-0 flex items-end justify-center space-x-1 sm:space-x-1.5 p-4 pb-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300 [mask-image:linear-gradient(to_top,transparent_1%,#000_80%)]">
    {[
      {
        h: 40,
        c: 'bg-[var(--color-sort-value)] opacity-70',
        hc: 'bg-[var(--color-sort-highlight)] opacity-80',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 20,
        c: 'bg-[var(--color-sort-compare)] opacity-70',
        hc: 'bg-[var(--color-sort-highlight)] opacity-80',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 10,
        c: 'bg-[var(--color-sort-swap)] opacity-70',
        hc: 'bg-[var(--color-sort-highlight)] opacity-80',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 50,
        c: 'bg-[var(--color-sort-sorted)] opacity-70',
        hc: 'bg-[var(--color-sort-highlight)] opacity-80',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 50,
        c: 'bg-[var(--color-sort-value)] opacity-60',
        hc: 'bg-[var(--color-sort-highlight)] opacity-70',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 30,
        c: 'bg-[var(--color-sort-compare)] opacity-60',
        hc: 'bg-[var(--color-sort-highlight)] opacity-70',
        t: 'group-hover:translate-y-1',
      },
      {
        h: 30,
        c: 'bg-[var(--color-sort-swap)] opacity-60',
        hc: 'bg-[var(--color-sort-highlight)] opacity-70',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 50,
        c: 'bg-[var(--color-sort-sorted)] opacity-60',
        hc: 'bg-[var(--color-sort-highlight)] opacity-70',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 30,
        c: 'bg-[var(--color-sort-value)] opacity-50',
        hc: 'bg-[var(--color-sort-highlight)] opacity-60',
        t: 'group-hover:translate-y-1',
      },
      {
        h: 70,
        c: 'bg-[var(--color-sort-compare)] opacity-50',
        hc: 'bg-[var(--color-sort-highlight)] opacity-60',
        t: 'group-hover:-translate-y-2',
      },
      {
        h: 20,
        c: 'bg-[var(--color-sort-swap)] opacity-50',
        hc: 'bg-[var(--color-sort-highlight)] opacity-60',
        t: 'group-hover:translate-y-2',
      },
      {
        h: 90,
        c: 'bg-[var(--color-sort-sorted)] opacity-50',
        hc: 'bg-[var(--color-sort-highlight)] opacity-60',
        t: 'group-hover:-translate-y-1',
      },
      {
        h: 40,
        c: 'bg-[var(--color-sort-value)] opacity-40',
        hc: 'bg-[var(--color-sort-highlight)] opacity-50',
        t: 'group-hover:translate-y-1',
      },
      {
        h: 60,
        c: 'bg-[var(--color-sort-compare)] opacity-40',
        hc: 'bg-[var(--color-sort-highlight)] opacity-50',
        t: 'group-hover:-translate-y-0.5',
      },
    ].map(
      (
        bar,
        index // Changed key to index
      ) => (
        <div
          key={index} // Using index as key
          className={cn(
            'w-3 sm:w-3.5 rounded-t-sm transition-all duration-500 ease-out',
            bar.c, // Base color and opacity
            `group-hover:${bar.hc.split(' ')[0]} group-hover:${bar.hc.split(' ')[1]}`, // Hover color and opacity
            bar.t
          )}
          style={{ height: `${bar.h}%` }}
        />
      )
    )}
    {/* Floor element for the bars */}
    <div className="absolute left-4 right-4 bottom-6 h-px bg-[var(--border)] opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
  </div>
)

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

const MarkdownPreviewBackground = () => (
  <div className="absolute inset-0 p-4 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]">
    <div className="relative w-full h-full max-w-md max-h-full flex flex-col space-y-2 text-xs font-mono text-[var(--muted-foreground)] leading-tight">
      {/* Sample Markdown-like blocks */}
      <div className="bg-background/70 p-2 rounded border border-muted shadow-md">
        ```typescript
        <br />
        function greet(name: string): string &#123;
        <br />
        &nbsp;&nbsp;return `Hello, $&#123;name&#125;`;
        <br />
        &#125;
      </div>

      <div className="bg-background/70 p-2 rounded border border-muted shadow-md">
        | Name | Type | Default |<br />
        |------|------|---------|
        <br />| title | string | &quot; &quot; |
      </div>
    </div>
  </div>
)

interface Feature {
  name: string
  description: string
  href: string
  cta: string
  background?: ReactNode
  Icon: React.ElementType
  className: string
  subFeatures?: string[]
}

const featuresData: Feature[] = [
  {
    name: 'Boolean Algebra Simplifier',
    description: 'Simplify expressions and gain insights into logical operations.',
    href: '/logic/boolean-algebra',
    cta: 'Explore Tool',
    Icon: Calculator,
    className: 'md:col-span-2',
    background: <BooleanAlgebraBackground />,
    subFeatures: [
      'Karnaugh Maps (K-Maps)',
      'Truth Table Generation',
      'Venn Diagram Visualization',
      'Step-by-step Simplification',
    ],
  },
  {
    name: 'Markdown Previewer',
    description: 'Render Markdown content in real-time with support for KaTeX, Mermaid, and more.',
    href: '/tasks/markdown',
    cta: 'Try Previewer',
    Icon: FileText,
    background: <MarkdownPreviewBackground />,
    className: 'md:col-span-1',
    subFeatures: [
      'Live Markdown Rendering',
      'KaTeX Math Support',
      'Mermaid Diagram Integration',
      'Syntax Highlighting for Code Blocks',
      'Table Formatting',
      'GitHub Flavored Markdown (GFM) options',
    ],
  },

  {
    name: 'Typing Test',
    description: 'Measure and enhance your typing speed and precision.',
    href: '/tasks/keyboard',
    cta: 'Start Typing',
    Icon: KeyboardIcon,
    className: 'md:col-span-1',
    background: <TypingTestBackground />,
    subFeatures: [
      'Words Per Minute (WPM) Tracking',
      'Accuracy Percentage',
      'Character & Error Count',
    ],
  },
  {
    name: 'Pomodoro Timer',
    description: 'Boost focus with timed work and break intervals using the Pomodoro technique.',
    href: '/tasks/pomodoro',
    cta: 'Start Timer',
    Icon: TimerIcon,
    className: 'md:col-span-2',
    background: <PomodoroTimerBackground />,
    subFeatures: [
      'Customizable Work/Break Durations',
      'Session Counter',
      'Audio & Visual Notifications',
      'Productivity Stats',
    ],
  },
  {
    name: 'Sort Algorithm Visualizer',
    description: 'Watch sorting algorithms animate and understand their mechanics.',
    href: '/logic/sort',
    cta: 'Visualize Sorts',
    Icon: BarChartHorizontalBig,
    className: 'md:col-span-3',
    background: <SortVisualizerBackground />,
    subFeatures: [
      'Multiple Algorithms (Merge, Quick, etc.)',
      'Step Controls (Play, Pause, Next)',
      'Customizable Array Size & Speed',
    ],
  },
]

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-6rem)] justify-center items-center sm:py-12">
      <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-4">
        {featuresData.map(feature => (
          <BentoCard
            key={feature.name}
            name={feature.name}
            className={feature.className}
            background={feature.background}
            Icon={feature.Icon || Lightbulb}
            description={feature.description}
            href={feature.href}
            cta={feature.cta}
          />
        ))}
      </BentoGrid>
    </div>
  )
}
