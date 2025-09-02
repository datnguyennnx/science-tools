import type { CheerioAPI } from 'cheerio'

export const getMetaContent =
  ($: CheerioAPI) =>
  (name: string, property?: string): string | undefined => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
    return $(selector).attr('content') || undefined
  }

export const getTitle = ($: CheerioAPI, ogTitle?: string): string => {
  return $('title').text().trim() || ogTitle || ''
}

export const getCanonical = ($: CheerioAPI): string | undefined => {
  return $('link[rel="canonical"]').attr('href') || undefined
}

export const getFavicon = ($: CheerioAPI): string | undefined => {
  return (
    $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || undefined
  )
}
