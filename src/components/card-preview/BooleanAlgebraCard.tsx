import { Calculator } from 'lucide-react'
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
            base: 'bg-[var(--kmap-group-single)] opacity-60',
            hover: 'opacity-80',
          },
          {
            val: '01',
            r: 0,
            c: 1,
            base: 'bg-[var(--kmap-group-pair)] opacity-70',
            hover: 'opacity-90',
          },
          {
            val: '11',
            r: 0,
            c: 2,
            base: 'bg-[var(--kmap-group-pair)] opacity-70',
            hover: 'opacity-90',
          },
          {
            val: '10',
            r: 0,
            c: 3,
            base: 'bg-[var(--kmap-group-quad)] opacity-60',
            hover: 'opacity-80',
          },
          {
            val: '0',
            r: 1,
            c: 0,
            base: 'bg-[var(--kmap-group-single)] opacity-60',
            hover: 'opacity-80',
          },
          {
            val: '1',
            r: 1,
            c: 1,
            base: 'bg-[var(--kmap-group-pair)] opacity-70',
            hover: 'opacity-90',
          },
          {
            val: '1',
            r: 1,
            c: 2,
            base: 'bg-[var(--kmap-group-pair)] opacity-70',
            hover: 'opacity-90',
          },
          {
            val: '0',
            r: 1,
            c: 3,
            base: 'bg-[var(--kmap-group-quad)] opacity-60',
            hover: 'opacity-80',
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

export const BooleanAlgebraCard = {
  name: 'Boolean Algebra Simplifier',
  description: 'Simplify expressions and gain insights into logical operations.',
  href: '/logic/boolean-algebra',
  cta: 'Explore Tool',
  Icon: Calculator,
  background: (<BooleanAlgebraBackground />) as ReactNode,
  subFeatures: [
    'Karnaugh Maps (K-Maps)',
    'Truth Table Generation',
    'Venn Diagram Visualization',
    'Step-by-step Simplification',
  ],
}
