'use client'

import { SocialPreviewCard } from './social-preview-card'
import type { SeoData } from '../engine/types'

interface PreviewGridProps {
  seoData: SeoData[]
  isLoading: boolean
}

export function PreviewGrid({ seoData, isLoading }: PreviewGridProps) {
  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="w-full">
          {seoData.map(data => (
            <SocialPreviewCard key={data.url} data={data} />
          ))}
        </div>
      )}
    </div>
  )
}
