import { FileText } from 'lucide-react'
import { ReactNode } from 'react'

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

export const MarkdownPreviewerCard = {
  name: 'Markdown Previewer',
  description: 'Render Markdown content in real-time with support for KaTeX, Mermaid, and more.',
  href: '/tasks/markdown',
  cta: 'Try Previewer',
  Icon: FileText,
  background: (<MarkdownPreviewBackground />) as ReactNode,
  subFeatures: [
    'Live Markdown Rendering',
    'KaTeX Math Support',
    'Mermaid Diagram Integration',
    'Syntax Highlighting for Code Blocks',
    'Table Formatting',
    'GitHub Flavored Markdown (GFM) options',
  ],
}
