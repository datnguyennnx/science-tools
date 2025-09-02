'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import { Search, MoreVertical, Star } from 'lucide-react'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface GoogleSearchCardProps {
  data: SeoData
}

export function GoogleSearchCard({ data }: GoogleSearchCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  const displayDescription = data.ogDescription || data.twitterDescription || data.description

  // Generate related search results from the domain
  const relatedResults = [
    {
      title: `${data.domain} - Home`,
      url: `https://${data.domain}`,
      description: 'Official website with comprehensive information and services.',
    },
    {
      title: `About - ${data.domain}`,
      url: `https://${data.domain}/about`,
      description: 'Learn more about our company, mission, and team.',
    },
    {
      title: `Contact - ${data.domain}`,
      url: `https://${data.domain}/contact`,
      description: 'Get in touch with us through various contact methods.',
    },
    {
      title: `Blog - ${data.domain}`,
      url: `https://${data.domain}/blog`,
      description: 'Latest news, insights, and updates from our team.',
    },
  ]

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.hostname}${urlObj.pathname !== '/' ? urlObj.pathname : ''}`
    } catch {
      return url
    }
  }

  return (
    <div className="google-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--google-card)',
          borderRadius: '0.5rem',
          border: '1px solid var(--google-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          {/* Google Header */}
          <div className="platform-header">
            <div className="flex items-center space-x-3">
              <SocialIcon
                url="https://google.com"
                style={{ height: 28, width: 28 }}
                className="rounded-full"
              />
              <span className="font-semibold text-[var(--google-text)] text-base">
                Google Search
              </span>
            </div>
          </div>

          {/* Search Bar Simulation */}
          <div className="p-4 border-b border-[var(--google-border)]">
            <div className="flex items-center space-x-3 bg-[var(--google-hover)] border border-[var(--google-border)] rounded-full px-4 py-3">
              <Search className="w-4 h-4 text-[var(--google-text-secondary)]" />
              <span className="flex-1 text-[var(--google-text)] text-sm">{data.domain}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto platform-scrollable">
            {/* Main Search Result */}
            <div className="p-4 border-b border-[var(--google-border)]">
              <div className="space-y-3">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-[var(--google-text-secondary)] break-all">
                    {formatUrl(data.url)}
                  </span>
                  <MoreVertical className="w-3 h-3 text-[var(--google-text-secondary)]" />
                </div>

                {/* Main Result */}
                <div className="space-y-2">
                  <h3 className="text-[var(--google-link)] hover:underline cursor-pointer text-xl leading-tight line-clamp-2 break-words">
                    {displayTitle || 'No title available'}
                  </h3>
                  <p className="text-[var(--google-text)] text-sm leading-relaxed line-clamp-3 break-words">
                    {displayDescription || 'No description available'}
                  </p>
                </div>

                {/* Rich Result with Image */}
                {mainImage && (
                  <div className="flex items-start space-x-4 bg-[var(--google-hover)] p-3 rounded-lg">
                    <div className="flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt="Preview"
                        width={120}
                        height={90}
                        className="object-cover rounded"
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-[var(--google-text)] text-sm">
                        Featured Content
                      </h4>
                      <p className="text-[var(--google-text-secondary)] text-xs line-clamp-3">
                        {displayDescription || 'Visual content from this page'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Results from Sitemap */}
            <div className="p-4">
              <h4 className="text-[var(--google-text)] font-medium text-sm mb-3">
                More results from {data.domain}
              </h4>

              <div className="space-y-3">
                {relatedResults.map(result => (
                  <div key={result.url} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-[var(--google-link)] hover:underline cursor-pointer text-sm font-medium line-clamp-1 break-words">
                        {result.title}
                      </h5>
                    </div>
                    <div className="text-[var(--google-url)] text-xs break-all">
                      {formatUrl(result.url)}
                    </div>
                    <p className="text-[var(--google-text)] text-xs leading-relaxed line-clamp-2 break-words">
                      {result.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* People Also Ask */}
              <div className="mt-4 pt-4 border-t border-[var(--google-border)]">
                <h4 className="text-[var(--google-text)] font-medium text-sm mb-3">
                  People also ask
                </h4>
                <div className="space-y-2">
                  <div className="text-[var(--google-text)] text-sm hover:bg-[var(--google-hover)] p-2 rounded cursor-pointer">
                    What is {data.domain}?
                  </div>
                  <div className="text-[var(--google-text)] text-sm hover:bg-[var(--google-hover)] p-2 rounded cursor-pointer">
                    How to use {data.domain}?
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-4 border-t border-[var(--google-border)] flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-[var(--google-text-secondary)]">
                  <span>{data.responseTime}ms response</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Save</span>
                  </div>
                </div>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{
                    color: 'white',
                    background: 'var(--google-primary)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = 'var(--google-primary-hover)')
                  }
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--google-primary)')}
                >
                  Visit Page
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
