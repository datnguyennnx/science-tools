import { BarChartHorizontalBig } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
    ].map(bar => (
      <div
        key={`bar-${bar.h}-${bar.c}`}
        className={cn(
          'w-3 sm:w-3.5 rounded-t-sm transition-all duration-500 ease-out',
          bar.c, // Base color and opacity
          `group-hover:${bar.hc.split(' ')[0]} group-hover:${bar.hc.split(' ')[1]}`, // Hover color and opacity
          bar.t
        )}
        style={{ height: `${bar.h}%` }}
      />
    ))}
    {/* Floor element for the bars */}
    <div className="absolute left-4 right-4 bottom-6 h-px bg-[var(--border)] opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
  </div>
)

export const SortVisualizerCard = {
  name: 'Sort Algorithm Visualizer',
  description: 'Watch sorting algorithms animate and understand their mechanics.',
  href: '/logic/sort',
  cta: 'Visualize Sorts',
  Icon: BarChartHorizontalBig,
  background: (<SortVisualizerBackground />) as ReactNode,
  subFeatures: [
    'Multiple Algorithms (Merge, Quick, etc.)',
    'Step Controls (Play, Pause, Next)',
    'Customizable Array Size & Speed',
  ],
}
