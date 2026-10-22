import { NextRequest, NextResponse } from 'next/server'
import { getCurrentMonthSponsors } from '@/lib/sponsors'
import { isValidCity } from '@/lib/cities'
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache'

export const dynamic = 'force-dynamic'

// ?city=TRIVANDRUM returns that chapter's sponsors; no city returns homepage sponsors.
export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get('city')
  const sponsors = await getCurrentMonthSponsors(isValidCity(cityParam) ? cityParam : null)
  return NextResponse.json({ sponsors }, { headers: PUBLIC_CACHE_HEADERS })
}
