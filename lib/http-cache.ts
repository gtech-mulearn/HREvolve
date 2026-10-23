// Cache headers for public read-only APIs. The public pages now get their data
// server-side (ISR, purged instantly by revalidatePublicPages() on admin edits), so
// these APIs are only a client-side fallback. revalidatePath can't purge CDN-cached
// API responses, so keep the window short: at most ~1 minute of staleness.
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30',
}
