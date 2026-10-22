// Cache headers for public read-only APIs. Vercel's edge serves the cached response for
// 60s and refreshes it in the background for up to 5 min, so admin edits (publishing an
// event, assigning a sponsor) can take up to about a minute to appear publicly.
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}
