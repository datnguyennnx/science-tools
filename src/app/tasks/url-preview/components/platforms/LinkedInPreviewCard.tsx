'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import { ThumbsUp, MessageCircle, Repeat, Send } from 'lucide-react'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface LinkedInPreviewCardProps {
  data: SeoData
}

export function LinkedInPreviewCard({ data }: LinkedInPreviewCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  // const displayDescription = data.ogDescription || data.twitterDescription || data.description

  const engagement = {
    likes: 128,
    comments: 19,
  }

  return (
    <div className="linkedin-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--linkedin-card)',
          borderRadius: '0.5rem',
          border: '1px solid var(--linkedin-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'var(--linkedin-card)',
              borderBottom: '1px solid var(--linkedin-border)',
            }}
          >
            <div className="flex items-center space-x-3">
              <SocialIcon
                network="linkedin"
                style={{ height: 32, width: 32 }}
                className="rounded-sm"
              />
              <span className="font-bold text-lg" style={{ color: 'var(--linkedin-text)' }}>
                LinkedIn
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--linkedin-card)' }} className="flex flex-col">
            <div className="platform-scrollable overflow-y-auto p-4">
              <div className="pb-3">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--linkedin-primary), #42a5f5)',
                    }}
                  ></div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-base"
                      style={{ color: 'var(--linkedin-text)' }}
                    >
                      Industry Expert
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--linkedin-text-secondary)' }}>
                      10,234 followers
                    </p>
                    <p className="text-sm" style={{ color: 'var(--linkedin-text-secondary)' }}>
                      2d • 🌎
                    </p>
                  </div>
                </div>
              </div>

              <div className="pb-3">
                <p
                  className="text-base leading-relaxed break-words"
                  style={{ color: 'var(--linkedin-text)' }}
                >
                  Excited to share this insightful article on the future of AI. A must-read for
                  anyone in the tech industry! #AI #TechTrends
                </p>
              </div>

              <div className="mb-2">
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--linkedin-border)' }}
                >
                  {mainImage && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={mainImage}
                        alt="Preview"
                        fill
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="p-3" style={{ background: 'var(--linkedin-hover)' }}>
                    <p
                      className="text-xs uppercase tracking-wider font-medium mb-1"
                      style={{ color: 'var(--linkedin-text-secondary)' }}
                    >
                      {data.domain}
                    </p>
                    <h4
                      className="font-semibold text-base leading-tight mb-2 hover:underline cursor-pointer break-words"
                      style={{ color: 'var(--linkedin-link)' }}
                    >
                      {displayTitle || 'No title available'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="px-4 py-2 flex items-center justify-between text-sm"
              style={{
                color: 'var(--linkedin-text-secondary)',
              }}
            >
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" style={{ color: 'var(--linkedin-success)' }} />
                <span>{engagement.likes}</span>
              </div>
              <span>{engagement.comments} comments</span>
            </div>

            <div
              className="px-4 py-1 flex justify-around"
              style={{ borderTop: '1px solid var(--linkedin-border)' }}
            >
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-full justify-center"
                style={{ color: 'var(--linkedin-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--linkedin-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Like</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-full justify-center"
                style={{ color: 'var(--linkedin-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--linkedin-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Comment</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-full justify-center"
                style={{ color: 'var(--linkedin-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--linkedin-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Repeat className="w-5 h-5" />
                <span>Repost</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold w-full justify-center"
                style={{ color: 'var(--linkedin-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--linkedin-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
