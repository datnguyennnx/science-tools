'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface DiscordPreviewCardProps {
  data: SeoData
}

export function DiscordPreviewCard({ data }: DiscordPreviewCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  const displayDescription = data.ogDescription || data.twitterDescription || data.description

  // Random conversation data for authentic feel
  const conversations = [
    {
      username: 'TechExplorer',
      avatar: 'user1',
      time: 'Today at 2:15 PM',
      message: 'Hey everyone! Found this interesting article',
    },
    {
      username: 'CodeNinja',
      avatar: 'user2',
      time: 'Today at 2:16 PM',
      message: 'Oh nice! Thanks for sharing 👀',
    },
    {
      username: 'DesignGuru',
      avatar: 'user3',
      time: 'Today at 2:17 PM',
      message: 'This looks really useful, checking it out now',
    },
  ]

  return (
    <div className="discord-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--discord-card)',
          borderRadius: '0.5rem',
          border: '1px solid var(--discord-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          {/* Discord Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'var(--discord-card)',
              borderBottom: '1px solid var(--discord-border)',
            }}
          >
            <div className="flex items-center space-x-3">
              <SocialIcon
                network="discord"
                style={{ height: 28, width: 28 }}
                className="rounded-full"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg" style={{ color: 'var(--discord-text-muted)' }}>
                  #
                </span>
                <span className="font-semibold text-base" style={{ color: 'var(--discord-text)' }}>
                  general
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="p-4 overflow-y-auto platform-scrollable flex-1"
            style={{ background: 'var(--discord-card)' }}
          >
            {conversations.map(msg => (
              <div
                key={msg.username}
                className="flex gap-3 mb-4 p-1 rounded transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--discord-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className={`w-10 h-10 rounded-full flex-shrink-0 ${
                    msg.avatar === 'user1'
                      ? 'bg-gradient-to-br from-[var(--discord-primary)] to-blue-400'
                      : msg.avatar === 'user2'
                        ? 'bg-gradient-to-br from-[var(--discord-mention)] to-green-400'
                        : 'bg-gradient-to-br from-orange-400 to-yellow-400'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-semibold text-base"
                      style={{ color: 'var(--discord-text)' }}
                    >
                      {msg.username}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--discord-text-muted)' }}>
                      {msg.time}
                    </span>
                  </div>
                  <div
                    className="text-base leading-5 break-words"
                    style={{ color: 'var(--discord-text)' }}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}

            {/* Link Embed Message */}
            <div
              className="flex gap-3 mb-4 p-1 rounded transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--discord-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-[var(--discord-primary)] to-blue-400"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold text-base"
                    style={{ color: 'var(--discord-text)' }}
                  >
                    TechExplorer
                  </span>
                  <span className="text-xs" style={{ color: 'var(--discord-text-muted)' }}>
                    Today at 2:18 PM
                  </span>
                </div>
                <div className="text-base leading-5 mb-2" style={{ color: 'var(--discord-text)' }}>
                  {data.url}
                </div>

                {/* Discord Rich Embed */}
                <div
                  className="rounded overflow-hidden max-w-md"
                  style={{
                    background: 'var(--discord-background)',
                    borderLeft: '4px solid var(--discord-primary)',
                  }}
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

                  <div className="p-3 space-y-2">
                    <h4
                      className="font-semibold text-sm hover:underline cursor-pointer break-words"
                      style={{ color: 'var(--discord-link)' }}
                    >
                      {displayTitle || 'No title available'}
                    </h4>
                    <p
                      className="text-sm leading-5 break-words"
                      style={{ color: 'var(--discord-text)' }}
                    >
                      {displayDescription || 'No description available'}
                    </p>
                    <div
                      className="text-xs break-words"
                      style={{ color: 'var(--discord-text-secondary)' }}
                    >
                      {data.domain} • {data.responseTime}ms response
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up reactions */}
            <div
              className="flex gap-3 mb-4 p-1 rounded transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--discord-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-[var(--discord-mention)] to-green-400"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold text-base"
                    style={{ color: 'var(--discord-text)' }}
                  >
                    CodeNinja
                  </span>
                  <span className="text-xs" style={{ color: 'var(--discord-text-muted)' }}>
                    Today at 2:19 PM
                  </span>
                </div>
                <div
                  className="text-base leading-5 break-words"
                  style={{ color: 'var(--discord-text)' }}
                >
                  Bookmarked! This will be helpful for my project 🔖
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
