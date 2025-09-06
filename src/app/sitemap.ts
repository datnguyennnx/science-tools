import { MetadataRoute } from 'next'

const BASE_URL = 'https://data-science.hallucinationguys.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Date for lastmod, can be dynamic based on actual content updates
  const lastModified = new Date().toISOString()

  // Define static routes
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/logic/boolean-algebra`,
      lastModified,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tasks/pomodoro`,
      lastModified,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tasks/keyboard`,
      lastModified,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/tasks/json-formatter`,
      lastModified,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tasks/markdown`,
      lastModified,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/tasks/url-preview`,
      lastModified,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tasks/text-diff`,
      lastModified,
      priority: 0.7,
    },
  ]

  return [...staticRoutes]
}
