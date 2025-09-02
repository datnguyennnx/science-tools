'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import { ChevronUp, ChevronDown, MessageSquare, Share, Bookmark } from 'lucide-react'
import Image from 'next/image'
import type { SeoData } from '../../engine/types'

interface RedditPreviewCardProps {
  data: SeoData
}

export function RedditPreviewCard({ data }: RedditPreviewCardProps) {
  const mainImage = data.ogImage || data.twitterImage || data.image
  const displayTitle = data.ogTitle || data.twitterTitle || data.title
  const displayDescription = data.ogDescription || data.twitterDescription || data.description

  // Reddit comment tree data
  const comments = [
    {
      user: 'tech_enthusiast',
      time: '3h',
      karma: 42,
      content: 'This is exactly what I was looking for! Great find OP.',
      replies: [
        {
          user: 'code_reviewer',
          time: '2h',
          karma: 15,
          content: 'Agreed! The documentation looks really comprehensive.',
        },
      ],
    },
    {
      user: 'curious_dev',
      time: '2h',
      karma: 28,
      content:
        'Has anyone tried implementing this yet? Would love to hear about real-world experiences.',
      replies: [
        {
          user: 'senior_engineer',
          time: '1h',
          karma: 67,
          content: "I've been using this in production for 6 months. Works great, very stable.",
        },
        {
          user: 'junior_coder',
          time: '1h',
          karma: 8,
          content:
            "Just started using it last week, so far so good! The learning curve isn't too steep.",
        },
      ],
    },
    {
      user: 'skeptical_programmer',
      time: '45m',
      karma: -2,
      content: "Looks interesting but I'm not convinced it's better than the existing solutions.",
    },
  ]

  return (
    <div className="reddit-platform h-full">
      <Card
        className="overflow-hidden shadow-lg border-0 flex flex-col h-full"
        style={{
          background: 'var(--reddit-card)',
          borderRadius: '0.75rem',
          border: '1px solid var(--reddit-border)',
        }}
      >
        <CardContent className="p-0 flex flex-col">
          {/* Reddit Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'var(--reddit-card)',
              borderBottom: '1px solid var(--reddit-border)',
            }}
          >
            <div className="flex items-center space-x-3">
              <SocialIcon
                network="reddit"
                style={{ height: 28, width: 28 }}
                className="rounded-full"
              />
              <span className="font-bold text-base" style={{ color: 'var(--reddit-text)' }}>
                r/programming
              </span>
            </div>
          </div>

          {/* Reddit Post */}
          <div className="flex" style={{ background: 'var(--reddit-card)' }}>
            {/* Voting Sidebar */}
            <div
              className="w-12 flex flex-col items-center py-3 px-2"
              style={{ background: 'var(--reddit-hover)' }}
            >
              <button
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                style={{ color: 'var(--reddit-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--reddit-upvote)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--reddit-text-secondary)')}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold py-1" style={{ color: 'var(--reddit-text)' }}>
                247
              </span>
              <button
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                style={{ color: 'var(--reddit-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--reddit-downvote)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--reddit-text-secondary)')}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex-grow">
                <div className="text-xs mb-2" style={{ color: 'var(--reddit-text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--reddit-text)' }}>
                    r/programming
                  </span>
                  <span className="mx-1">•</span>
                  <span>Posted by u/developer_guru</span>
                  <span className="mx-1">•</span>
                  <span>4 hours ago</span>
                </div>

                <h3
                  className="font-medium text-lg mb-3 leading-tight break-words"
                  style={{ color: 'var(--reddit-text)' }}
                >
                  {displayTitle || 'Interesting development resource I found'}
                </h3>

                {/* Link Preview */}
                <div
                  className="rounded overflow-hidden mb-3"
                  style={{ border: '1px solid var(--reddit-border)' }}
                >
                  <div className="flex">
                    <div className="flex-1 p-3">
                      <p
                        className="text-sm mb-1 break-words"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                      >
                        {data.domain}
                      </p>
                      <h4
                        className="font-medium text-sm leading-tight mb-1 cursor-pointer hover:underline break-words"
                        style={{ color: 'var(--reddit-link)' }}
                      >
                        {displayTitle || 'No title available'}
                      </h4>
                      <p
                        className="text-xs leading-relaxed break-words"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                      >
                        {displayDescription || 'No description available'}
                      </p>
                    </div>
                    {mainImage && (
                      <div className="w-20 h-20 flex-shrink-0">
                        <Image
                          src={mainImage}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Actions */}
                <div
                  className="flex items-center gap-4 text-xs mb-4"
                  style={{ color: 'var(--reddit-text-secondary)' }}
                >
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--reddit-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>23 Comments</span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--reddit-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--reddit-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save</span>
                  </div>
                  <span className="ml-auto">{data.responseTime}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div
            className="platform-scrollable overflow-y-auto flex-1"
            style={{
              borderTop: '1px solid var(--reddit-border)',
              background: 'var(--reddit-card)',
            }}
          >
            <div className="p-4">
              <div className="text-sm font-medium mb-4" style={{ color: 'var(--reddit-text)' }}>
                Comments
              </div>

              {comments.map(comment => (
                <div key={comment.user} className="mb-4">
                  {/* Main Comment */}
                  <div className="flex items-start gap-2">
                    {/* Comment Voting */}
                    <div className="flex flex-col items-center mr-2">
                      <button
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--reddit-upvote)')}
                        onMouseLeave={e =>
                          (e.currentTarget.style.color = 'var(--reddit-text-secondary)')
                        }
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            comment.karma >= 0 ? 'var(--reddit-upvote)' : 'var(--reddit-downvote)',
                        }}
                      >
                        {comment.karma}
                      </span>
                      <button
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--reddit-downvote)')}
                        onMouseLeave={e =>
                          (e.currentTarget.style.color = 'var(--reddit-text-secondary)')
                        }
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1">
                      <div
                        className="text-xs mb-1"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                      >
                        <span className="font-medium" style={{ color: 'var(--reddit-text)' }}>
                          u/{comment.user}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{comment.karma} points</span>
                        <span className="mx-1">•</span>
                        <span>{comment.time} ago</span>
                      </div>
                      <p
                        className="text-sm leading-relaxed mb-2 break-words"
                        style={{ color: 'var(--reddit-text)' }}
                      >
                        {comment.content}
                      </p>
                      <div
                        className="flex items-center gap-3 text-xs"
                        style={{ color: 'var(--reddit-text-secondary)' }}
                      >
                        <button className="hover:underline">Reply</button>
                        <button className="hover:underline">Share</button>
                        <button className="hover:underline">Report</button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div
                      className="ml-8 mt-3 pl-4"
                      style={{ borderLeft: '2px solid var(--reddit-border)' }}
                    >
                      {comment.replies.map(reply => (
                        <div key={reply.user} className="mb-3">
                          <div className="flex items-start gap-2">
                            {/* Reply Voting */}
                            <div className="flex flex-col items-center mr-2">
                              <button
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--reddit-text-secondary)' }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.color = 'var(--reddit-upvote)')
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.color = 'var(--reddit-text-secondary)')
                                }
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <span
                                className="text-xs font-bold"
                                style={{
                                  color:
                                    reply.karma >= 0
                                      ? 'var(--reddit-upvote)'
                                      : 'var(--reddit-downvote)',
                                }}
                              >
                                {reply.karma}
                              </span>
                              <button
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--reddit-text-secondary)' }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.color = 'var(--reddit-downvote)')
                                }
                                onMouseLeave={e =>
                                  (e.currentTarget.style.color = 'var(--reddit-text-secondary)')
                                }
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Reply Content */}
                            <div className="flex-1">
                              <div
                                className="text-xs mb-1"
                                style={{ color: 'var(--reddit-text-secondary)' }}
                              >
                                <span
                                  className="font-medium"
                                  style={{ color: 'var(--reddit-text)' }}
                                >
                                  u/{reply.user}
                                </span>
                                <span className="mx-1">•</span>
                                <span>{reply.karma} points</span>
                                <span className="mx-1">•</span>
                                <span>{reply.time} ago</span>
                              </div>
                              <p
                                className="text-sm leading-relaxed mb-2 break-words"
                                style={{ color: 'var(--reddit-text)' }}
                              >
                                {reply.content}
                              </p>
                              <div
                                className="flex items-center gap-3 text-xs"
                                style={{ color: 'var(--reddit-text-secondary)' }}
                              >
                                <button className="hover:underline">Reply</button>
                                <button className="hover:underline">Share</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
