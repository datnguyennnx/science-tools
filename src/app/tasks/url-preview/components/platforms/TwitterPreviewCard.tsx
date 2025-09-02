'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface TwitterPreviewCardProps {
  data: SeoData
}

export function TwitterPreviewCard({ data }: TwitterPreviewCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  const displayDescription = data.ogDescription || data.twitterDescription || data.description

  // Twitter engagement data
  const engagement = {
    replies: 24,
    retweets: 89,
    likes: 156,
    views: '2.1K',
  }

  return (
    <div className="twitter-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--x-card)',
          borderRadius: '0.5rem',
          border: '1px solid var(--x-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          {/* Twitter Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'var(--x-card)',
              borderBottom: '1px solid var(--x-border)',
            }}
          >
            <div className="flex items-center space-x-3">
              <SocialIcon network="x" style={{ height: 28, width: 28 }} className="rounded-full" />
              <span className="font-bold text-lg" style={{ color: 'var(--x-text)' }}>
                𝕏
              </span>
            </div>
          </div>

          {/* Tweet Content */}
          <div style={{ background: 'var(--x-card)' }} className="flex flex-col">
            <div className="platform-scrollable overflow-y-auto p-4">
              {/* Tweet Header */}
              <div className="pb-3">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1da1f2, #657786)' }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-base" style={{ color: 'var(--x-text)' }}>
                          Tech Enthusiast
                        </span>
                        <span className="text-base" style={{ color: 'var(--x-text-secondary)' }}>
                          @tech_enthusiast
                        </span>
                        <span style={{ color: 'var(--x-text-secondary)' }}>·</span>
                        <span className="text-base" style={{ color: 'var(--x-text-secondary)' }}>
                          2h
                        </span>
                      </div>
                      <button
                        className="p-2 rounded-full transition-colors"
                        style={{ color: 'var(--x-text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--x-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tweet Text */}
              <div className="pb-3">
                <p
                  className="text-base leading-normal break-words"
                  style={{ color: 'var(--x-text)' }}
                >
                  Just discovered this amazing resource! 🚀 This could be a game-changer for
                  developers. Definitely worth checking out!
                </p>
              </div>

              {/* Twitter Card Preview */}
              <div className="mb-4">
                <div
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={{ border: '1px solid var(--x-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--x-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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

                  <div className="p-3">
                    <p className="text-xs mb-1" style={{ color: 'var(--x-text-secondary)' }}>
                      {data.domain}
                    </p>
                    <h4
                      className="font-bold text-base leading-tight mb-1 break-words"
                      style={{ color: 'var(--x-text)' }}
                    >
                      {displayTitle || 'No title available'}
                    </h4>
                    <p
                      className="text-sm leading-normal break-words"
                      style={{ color: 'var(--x-text-secondary)' }}
                    >
                      {displayDescription || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tweet Actions */}
            <div className="px-4 py-2 flex justify-between max-w-md">
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200"
                style={{ color: 'var(--x-text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--x-reply)'
                  e.currentTarget.style.background = 'rgba(29, 161, 242, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--x-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{engagement.replies}</span>
              </button>
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200"
                style={{ color: 'var(--x-text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--x-retweet)'
                  e.currentTarget.style.background = 'rgba(23, 191, 99, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--x-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm">{engagement.retweets}</span>
              </button>
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200"
                style={{ color: 'var(--x-text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--x-heart)'
                  e.currentTarget.style.background = 'rgba(224, 36, 94, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--x-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">{engagement.likes}</span>
              </button>
              <button
                className="p-2 rounded-full transition-all duration-200"
                style={{ color: 'var(--x-text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--x-reply)'
                  e.currentTarget.style.background = 'rgba(29, 161, 242, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--x-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Share className="w-5 h-5" />
              </button>
            </div>

            {/* Tweet Stats */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--x-border)' }}
            >
              <div
                className="flex items-center space-x-4 text-sm"
                style={{ color: 'var(--x-text-secondary)' }}
              >
                <span>{engagement.views} views</span>
                <span>{data.responseTime}ms response</span>
              </div>
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: 'var(--x-link)' }}
              >
                View post
              </a>
            </div>
          </div>

          {/* Reply Thread Preview */}
          <div
            className="p-4"
            style={{
              borderTop: '1px solid var(--x-border)',
              background: 'var(--x-hover)',
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #17bf63, #26a69a)',
                }}
              ></div>
              <div className="flex-1">
                <p className="text-sm leading-normal" style={{ color: 'var(--x-text-secondary)' }}>
                  Replying to <span style={{ color: 'var(--x-reply)' }}>@tech_enthusiast</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
