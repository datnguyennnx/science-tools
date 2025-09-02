export interface SeoData {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  robots?: string
  author?: string
  published?: string
  modified?: string
  sitemap?: string
  rss?: string
  jsonLd?: Record<string, unknown>[]
  statusCode: number
  responseTime: number
  domain: string
}

export interface CrawlResult {
  success: boolean
  data?: CrawlData
  error?: string
}

export interface CrawlData {
  html: string
  responseTime: number
  statusCode: number
}
