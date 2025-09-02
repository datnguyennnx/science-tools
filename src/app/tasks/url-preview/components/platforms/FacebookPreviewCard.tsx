'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import { MessageCircle, Share, MoreHorizontal, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface FacebookPreviewCardProps {
  data: SeoData
}

export function FacebookPreviewCard({ data }: FacebookPreviewCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  const displayDescription = data.ogDescription || data.twitterDescription || data.description

  // Facebook post engagement data
  const engagement = {
    likes: 47,
    comments: 12,
    shares: 8,
    reactions: ['👍', '❤️', '😍'],
  }

  // Facebook comments data
  const comments = [
    {
      user: 'Sarah Johnson',
      time: '2h',
      content: 'This looks really interesting! Thanks for sharing 😊',
      likes: 5,
    },
    {
      user: 'Mike Chen',
      time: '1h',
      content: 'Been looking for something like this for my project. Perfect timing!',
      likes: 3,
    },
    {
      user: 'Emily Rodriguez',
      time: '45m',
      content: 'Bookmarked! Will definitely check this out later.',
      likes: 2,
    },
  ]

  return (
    <div className="facebook-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--fb-card)',
          borderRadius: '0.5rem',
          border: '1px solid var(--fb-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          {/* Facebook Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'var(--fb-card)',
              borderBottom: '1px solid var(--fb-border)',
            }}
          >
            <div className="flex items-center space-x-3">
              <SocialIcon
                network="facebook"
                style={{ height: 32, width: 32 }}
                className="rounded-full"
              />
              <span className="font-bold text-lg" style={{ color: 'var(--fb-text)' }}>
                Facebook
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div style={{ background: 'var(--fb-card)' }} className="flex flex-col">
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--fb-primary), #42a5f5)' }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: 'var(--fb-text)' }}>
                        Alex Thompson
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--fb-text-secondary)' }}>
                        2 hours ago • 🌐
                      </p>
                    </div>
                    <button
                      className="p-2 rounded-full transition-colors"
                      style={{ color: 'var(--fb-text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--fb-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Text */}
            <div className="px-4 pb-3">
              <p
                className="text-base leading-relaxed break-words"
                style={{ color: 'var(--fb-text)' }}
              >
                Found this amazing resource that I had to share with everyone! This could be really
                useful for our upcoming projects. 🚀
              </p>
            </div>

            {/* Link Preview Card */}
            <div className="mx-4 mb-4">
              <div
                className="rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
                style={{ border: '1px solid var(--fb-border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--fb-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {mainImage && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={mainImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="p-3">
                  <p
                    className="text-xs uppercase tracking-wider font-medium mb-1"
                    style={{ color: 'var(--fb-text-secondary)' }}
                  >
                    {data.domain}
                  </p>
                  <h4
                    className="font-semibold text-base leading-tight mb-2 hover:underline cursor-pointer break-words"
                    style={{ color: 'var(--fb-link)' }}
                  >
                    {displayTitle || 'No title available'}
                  </h4>
                  <p
                    className="text-sm leading-relaxed break-words"
                    style={{ color: 'var(--fb-text-secondary)' }}
                  >
                    {displayDescription || 'No description available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Bar */}
            <div
              className="px-4 py-2 flex items-center justify-between text-sm"
              style={{
                borderTop: '1px solid var(--fb-border)',
                borderBottom: '1px solid var(--fb-border)',
                color: 'var(--fb-text-secondary)',
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {engagement.reactions.map(reaction => (
                    <span key={reaction} className="text-base">
                      {reaction}
                    </span>
                  ))}
                </div>
                <span>{engagement.likes}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{engagement.comments} comments</span>
                <span>{engagement.shares} shares</span>
                <span>{data.responseTime}ms</span>
              </div>
            </div>

            {/* Action Bar */}
            <div
              className="px-4 py-2 flex justify-around"
              style={{ borderBottom: '1px solid var(--fb-border)' }}
            >
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{ color: 'var(--fb-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--fb-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Like</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{ color: 'var(--fb-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--fb-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Comment</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{ color: 'var(--fb-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--fb-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Share className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="p-4 platform-scrollable overflow-y-auto flex-1 relative">
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={comment.user} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{
                        background:
                          index === 0
                            ? 'linear-gradient(135deg, #ff7043, #ffab40)'
                            : index === 1
                              ? 'linear-gradient(135deg, #42a5f5, #7986cb)'
                              : 'linear-gradient(135deg, #66bb6a, #26a69a)',
                      }}
                    ></div>
                    <div className="flex-1">
                      <div
                        className="rounded-2xl px-3 py-2"
                        style={{ background: 'var(--fb-hover)' }}
                      >
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{ color: 'var(--fb-text)' }}
                        >
                          {comment.user}
                        </div>
                        <div
                          className="text-sm leading-relaxed break-words"
                          style={{ color: 'var(--fb-text)' }}
                        >
                          {comment.content}
                        </div>
                      </div>
                      <div
                        className="flex items-center space-x-4 mt-1 ml-3 text-xs"
                        style={{ color: 'var(--fb-text-secondary)' }}
                      >
                        <button className="hover:underline font-medium">
                          {comment.likes > 0 ? `Like (${comment.likes})` : 'Like'}
                        </button>
                        <button className="hover:underline">Reply</button>
                        <span>{comment.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
