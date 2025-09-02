import { Share2 } from 'lucide-react'
import { ReactNode } from 'react'

const UrlPreviewBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 opacity-50 group-hover:opacity-70 transition-all duration-500 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]">
    <div className="relative w-full h-full max-w-sm max-h-sm">
      <div className="absolute -left-4 top-8 w-3/5 h-2/5 bg-background/80 p-2 rounded-lg border border-muted shadow-md backdrop-blur-sm transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
        <div className="w-full h-3 rounded-t-md bg-[#1877f2] opacity-80 mb-2" />
        <div className="h-2 w-3/4 rounded-full bg-muted-foreground/30" />
        <div className="mt-1.5 h-2 w-1/2 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="absolute -right-4 bottom-8 w-3/5 h-2/5 bg-background/80 p-2 rounded-lg border border-muted shadow-md backdrop-blur-sm transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300">
        <div className="w-full h-3 rounded-t-md bg-[#1DA1F2] opacity-80 mb-2" />
        <div className="h-2 w-3/4 rounded-full bg-muted-foreground/30" />
        <div className="mt-1.5 h-2 w-1/2 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  </div>
)

export const UrlPreviewCard = {
  name: 'URL Previewer',
  description: 'See how your links will appear on different social platforms.',
  href: '/tasks/url-preview',
  cta: 'Preview URL',
  Icon: Share2,
  background: (<UrlPreviewBackground />) as ReactNode,
  className: 'md:col-span-3',
  subFeatures: [
    'Facebook, Twitter, LinkedIn Previews',
    'Google Search Result Snippet',
    'Discord & Reddit Embeds',
    'Real-time SEO Data Extraction',
  ],
}
