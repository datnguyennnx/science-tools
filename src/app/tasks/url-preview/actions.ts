'use server'

import { fetchWithRetries, extractSeoData, SeoData } from './engine'

function ensureProtocol(url: string): string {
  if (!/^(https|http):\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

export async function crawlUrlAction(url: string): Promise<SeoData[]> {
  if (!url) {
    return [
      {
        url,
        title: 'Error',
        description: 'URL parameter is required',
        statusCode: 400,
        responseTime: 0,
        domain: 'error',
      },
    ]
  }

  const fullUrl = ensureProtocol(url)

  try {
    new URL(fullUrl)
  } catch {
    return [
      {
        url,
        title: 'Error',
        description: 'Invalid URL format',
        statusCode: 400,
        responseTime: 0,
        domain: 'error',
      },
    ]
  }

  const crawlResult = await fetchWithRetries(fullUrl)

  if (!crawlResult.success || !crawlResult.data) {
    return [
      {
        url,
        title: 'Error',
        description: `Failed to crawl URL: ${crawlResult.error || 'Unknown error'}`,
        statusCode: 500,
        responseTime: 0,
        domain: 'error',
      },
    ]
  }

  const seoData = extractSeoData(
    fullUrl,
    crawlResult.data.html,
    crawlResult.data.responseTime,
    crawlResult.data.statusCode
  )

  return [seoData]
}
