import type { MetadataRoute } from 'next'
import { CITIES } from '@/lib/cities'

const BASE_URL = 'https://hrevolve.org'

// Static list of public pages - no DB call, so it's cheap to serve.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/events`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/gallery`, changeFrequency: 'monthly', priority: 0.6 },
    ...CITIES.map((city) => ({
      url: `${BASE_URL}/chapters/${city.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
