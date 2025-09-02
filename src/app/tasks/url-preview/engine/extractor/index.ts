import * as cheerio from 'cheerio'
import type { SeoData } from '../types'
import { getMetaContent, getTitle, getCanonical, getFavicon } from './extractMeta'
import { extractBestImage } from './extractImages'

export function extractSeoData(
  url: string,
  html: string,
  responseTime: number,
  statusCode: number
): SeoData {
  const $ = cheerio.load(html)
  const meta = getMetaContent($)

  const ogTitle = meta('og:title')
  const ogDescription = meta('og:description')
  const ogImage = meta('og:image')

  const twitterTitle = meta('twitter:title')
  const twitterDescription = meta('twitter:description')
  const twitterImage = meta('twitter:image')

  const title = getTitle($, ogTitle)
  const description = meta('description') || ogDescription
  const keywords =
    meta('keywords')
      ?.split(',')
      .map(k => k.trim())
      .filter(Boolean) || []
  const author = meta('author')
  const robots = meta('robots')
  const canonical = getCanonical($)
  const favicon = getFavicon($)

  let domain = ''
  try {
    domain = new URL(url).hostname
  } catch {
    domain = url
  }

  const image = extractBestImage($, domain, ogImage, twitterImage)

  const jsonLd = $('script[type="application/ld+json"]')
    .map((_, script) => {
      try {
        return JSON.parse($(script).html() || '{}')
      } catch {
        return null
      }
    })
    .get()
    .filter(Boolean)

  const seoData: SeoData = {
    url,
    title,
    description,
    image,
    favicon,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonical,
    robots,
    author,
    jsonLd,
    statusCode,
    responseTime,
    domain,
  }

  return seoData
}
