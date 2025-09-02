import { Diff } from 'lucide-react'
import { ReactNode } from 'react'

const TextDiffBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 opacity-40 group-hover:opacity-60 transition-all duration-500 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]">
    <div className="relative w-4/5 h-4/5 max-w-sm max-h-sm">
      {/* Text Diff Visualization */}
      <div className="w-full h-full flex flex-col font-mono text-xs text-[var(--muted-foreground)] leading-tight space-y-1">
        {/* Original text block */}
        <div className="bg-background/70 p-2 rounded border border-muted shadow-md backdrop-blur-sm">
          <div className="text-[var(--destructive)] font-bold text-xs mb-1">- Original</div>
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="w-4 text-center">-</span>
              <span className="text-[var(--destructive)] opacity-80">function hello() &#123;</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 text-center">-</span>
              <span className="text-[var(--destructive)] opacity-80">
                &nbsp;&nbsp;return &quot;Hello&quot;;
              </span>
            </div>
          </div>
        </div>

        {/* Modified text block */}
        <div className="bg-background/70 p-2 rounded border border-muted shadow-md backdrop-blur-sm">
          <div className="text-[var(--chart-3)] font-bold text-xs mb-1">+ Modified</div>
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="w-4 text-center">+</span>
              <span className="text-[var(--chart-3)] opacity-80">function greet(name) &#123;</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 text-center">+</span>
              <span className="text-[var(--chart-3)] opacity-80">
                &nbsp;&nbsp;return `Hello, $&#123;name&#125;`;
              </span>
            </div>
          </div>
        </div>

        {/* Unified diff indicator */}
        <div className="bg-background/70 p-2 rounded border border-muted shadow-md backdrop-blur-sm">
          <div className="text-[var(--chart-4)] font-bold text-xs mb-1">Unified View</div>
          <div className="space-y-0.5">
            <div className="flex items-center">
              <span className="w-4 text-center text-[var(--destructive)]">-</span>
              <span className="text-[var(--destructive)] opacity-60">function hello() &#123;</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 text-center text-[var(--chart-3)]">+</span>
              <span className="text-[var(--chart-3)] opacity-60">function greet(name) &#123;</span>
            </div>
          </div>
        </div>

        {/* Animated diff indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--chart-1)] rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>

        {/* Floating change indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={`diff-indicator-${i}`}
              className="absolute w-1 h-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                backgroundColor:
                  i % 3 === 0
                    ? 'var(--destructive)'
                    : i % 3 === 1
                      ? 'var(--chart-3)'
                      : 'var(--chart-4)',
                left: `${15 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.15}s`,
                animation: 'float 2s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export const TextDiffCard = {
  name: 'Text Diff Comparator',
  description: 'Compare text files and strings with side-by-side or unified diff views.',
  href: '/tasks/text-diff',
  cta: 'Compare Texts',
  Icon: Diff,
  background: (<TextDiffBackground />) as ReactNode,
  subFeatures: [
    'Side-by-Side & Unified Views',
    'Character-Level Diff Analysis',
    'Line-by-Line Comparison',
    'Real-time Text Synchronization',
    'Copy & Paste Support',
    'Large File Handling',
  ],
}
