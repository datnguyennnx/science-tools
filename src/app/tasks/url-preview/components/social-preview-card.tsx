'use client'

import {
  FacebookPreviewCard,
  TwitterPreviewCard,
  RedditPreviewCard,
  DiscordPreviewCard,
  GoogleSearchCard,
  LinkedInPreviewCard,
} from './platforms'
import type { SeoData } from '../engine/types'

interface SocialPreviewCardProps {
  data: SeoData
}

export function SocialPreviewCard({ data }: SocialPreviewCardProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
      <FacebookPreviewCard data={data} />
      <TwitterPreviewCard data={data} />
      <GoogleSearchCard data={data} />
      <RedditPreviewCard data={data} />
      <DiscordPreviewCard data={data} />
      <LinkedInPreviewCard data={data} />
    </div>
  )
}
