import type { CrawlData } from '../types'

export async function fetchWithRetries(
  url: string
): Promise<{ success: boolean; data?: CrawlData; error?: string }> {
  const maxRetries = 2
  let lastError: string = 'Unknown error occurred'

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now()

      try {
        new URL(url)
      } catch {
        return {
          success: false,
          error: `Invalid URL format: ${url}`,
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          DNT: '1',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000), // 15 second timeout
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          return {
            success: false,
            error: `Server blocked request (HTTP ${response.status})`,
          }
        }
        if (attempt < maxRetries) {
          lastError = `HTTP ${response.status}: ${response.statusText}`
          continue
        }
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const html = await response.text()

      return {
        success: true,
        data: {
          html,
          responseTime,
          statusCode: response.status,
        },
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error occurred'

      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError,
        }
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  return {
    success: false,
    error: lastError,
  }
}
