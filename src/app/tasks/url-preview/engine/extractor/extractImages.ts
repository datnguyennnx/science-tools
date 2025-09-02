import type { CheerioAPI } from 'cheerio'

const absoluteUrl = (url: string, domain: string) => {
  if (url.startsWith('http')) {
    return url
  }
  return new URL(url, domain).toString()
}

export const extractBestImage = (
  $: CheerioAPI,
  domain: string,
  ogImage?: string,
  twitterImage?: string
): string | undefined => {
  if (ogImage && ogImage.length > 0) {
    return absoluteUrl(ogImage, domain)
  }
  if (twitterImage && twitterImage.length > 0) {
    return absoluteUrl(twitterImage, domain)
  }

  const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
  if (favicon && favicon.length > 0) {
    return absoluteUrl(favicon, domain)
  }

  return undefined
}
