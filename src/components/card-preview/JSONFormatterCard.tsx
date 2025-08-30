import { Braces } from 'lucide-react'
import { ReactNode } from 'react'

const JSONFormatterBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 opacity-40 group-hover:opacity-60 transition-all duration-500 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]">
    <div className="relative w-4/5 h-4/5 max-w-sm max-h-sm">
      {/* JSON Structure Visualization */}
      <div className="w-full h-full flex flex-col items-center justify-center font-mono text-xs text-[var(--muted-foreground)] leading-tight">
        {/* JSON Object Structure */}
        <div className="bg-background/70 p-3 rounded-lg border border-muted shadow-md backdrop-blur-sm">
          <div className="text-[var(--primary)] font-bold mb-2">{'{'}</div>
          <div className="ml-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[var(--string)]">&quot;name&quot;:</span>
              <span className="text-[var(--string)]">&quot;John Doe&quot;</span>
              <span className="text-[var(--muted-foreground)]">,</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--string)]">&quot;age&quot;:</span>
              <span className="text-[var(--number)]">30</span>
              <span className="text-[var(--muted-foreground)]">,</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--string)]">&quot;active&quot;:</span>
              <span className="text-[var(--boolean)]">true</span>
            </div>
          </div>
          <div className="text-[var(--primary)] font-bold mt-2">{'}'}</div>
        </div>

        {/* Animated validation indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-[var(--primary)] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + i * 5}%`,
                animationDelay: `${i * 0.2}s`,
                animation: 'float 3s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export const JSONFormatterCard = {
  name: 'JSON Formatter',
  description:
    'Format, validate, and beautify JSON data with syntax highlighting and real-time preview.',
  href: '/tasks/json-formatter',
  cta: 'Format JSON',
  Icon: Braces,
  background: (<JSONFormatterBackground />) as ReactNode,
  className: 'md:col-span-1',
  subFeatures: [
    'Real-time JSON Formatting',
    'Syntax Validation & Error Detection',
    'Multiple Indentation Options',
    'Compact & Pretty Print Modes',
    'Key Sorting & Comment Removal',
    'File Upload & Download Support',
  ],
}
