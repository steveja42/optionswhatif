import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/schwab-tokens'
import { mockOptionChain } from '@/lib/mock-data'

// --- In-memory rate limiter ---
// Keyed by IP, tracks request timestamps in a rolling 60-second window.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

const ipRequestTimes = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const times = ipRequestTimes.get(ip) ?? []
  const recent = times.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  ipRequestTimes.set(ip, recent)
  // Drop idle IPs so the map can't grow without bound
  if (ipRequestTimes.size > 10_000) {
    for (const [key, ts] of ipRequestTimes) {
      if (now - ts[ts.length - 1] >= RATE_LIMIT_WINDOW_MS) ipRequestTimes.delete(key)
    }
  }
  return recent.length > RATE_LIMIT_MAX
}

// --- Same-site check ---
// Only the calculator page on this site should call this route. Browsers send
// Sec-Fetch-Site (and Referer) automatically and pages can't fake them, so this stops other
// websites and casual scripts. A determined script can copy the headers, so this raises the
// bar rather than being real authentication; the cache and rate limit cap the rest.
function isFromOwnSite(request: NextRequest): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite) return fetchSite === 'same-origin'

  // Older browsers without Sec-Fetch-*: require a Referer from this same host
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  if (!referer || !host) return false
  try {
    return new URL(referer).host === host
  } catch {
    return false
  }
}

// --- Input validation ---
const SYMBOL_RE = /^[A-Z]{1,5}(:[A-Z]{1,5})?$/
const MAX_SYMBOLS = 5
const VALID_CONTRACT_TYPES = new Set(['CALL', 'PUT', 'ALL'])
const MAX_STRIKE_COUNT = 50

// How long Netlify's CDN may reuse a successful option chain response (also the max quote age)
const CDN_CACHE_SECONDS = 5

// Longest upstream error message passed through to visitors
const MAX_ERROR_LENGTH = 300

function validateSymbols(raw: string): string[] | null {
  const symbols = raw
    .toUpperCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (symbols.length === 0 || symbols.length > MAX_SYMBOLS) return null
  if (symbols.some(s => !SYMBOL_RE.test(s))) return null
  return symbols
}

// --- Fields we expose to the client (whitelist) ---
function filterOptionChain(data: Record<string, unknown>): Record<string, unknown> {
  // Only pass through the fields the frontend actually uses.
  return {
    symbol: data.symbol,
    status: data.status,
    underlying: data.underlying,
    strategy: data.strategy,
    isDelayed: data.isDelayed,
    underlyingPrice: data.underlyingPrice,
    putExpDateMap: data.putExpDateMap,
    callExpDateMap: data.callExpDateMap,
  }
}

export async function GET(request: NextRequest) {
  if (!isFromOwnSite(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limit by IP. Netlify sets x-nf-client-connection-ip itself; x-forwarded-for can be spoofed.
  const ip =
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)

  // Validate symbols
  const rawSymbols = searchParams.get('symbols') ?? ''
  const symbols = validateSymbols(rawSymbols)
  if (!symbols) {
    return NextResponse.json(
      { error: 'Invalid or missing symbols parameter' },
      { status: 400 }
    )
  }

  // Validate contractType
  const contractType = (searchParams.get('contractType') ?? 'ALL').toUpperCase()
  if (!VALID_CONTRACT_TYPES.has(contractType)) {
    return NextResponse.json(
      { error: 'Invalid contractType' },
      { status: 400 }
    )
  }

  // Validate strikeCount
  const strikeCountRaw = searchParams.get('strikeCount')
  let strikeCount: number | null = null
  if (strikeCountRaw !== null) {
    strikeCount = parseInt(strikeCountRaw, 10)
    if (isNaN(strikeCount) || strikeCount < 0 || strikeCount > MAX_STRIKE_COUNT) {
      return NextResponse.json(
        { error: 'Invalid strikeCount' },
        { status: 400 }
      )
    }
  }

  // Mock mode — set USE_MOCK_DATA=true in .env.local to skip the upstream API entirely
  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(mockOptionChain)
  }

  // Get valid access token (server-side only)
  let accessToken: string
  try {
    accessToken = await getValidAccessToken()
  } catch (err) {
    // Details stay in the server log; visitors get a generic message
    console.error('[quotes] access token unavailable:', err)
    return NextResponse.json(
      { error: 'Quotes are temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  // Build Schwab API URL (only one symbol supported per option chain call)
  const symbol = symbols[0]
  const params = new URLSearchParams({
    symbol,
    contractType,
    includeUnderlyingQuote: 'true',
  })
  if (strikeCount !== null && strikeCount > 0) {
    params.set('strikeCount', String(strikeCount))
  }

  const schwabUrl = `https://api.schwabapi.com/marketdata/v1/chains?${params.toString()}`

  let schwabResponse: Response
  try {
    schwabResponse = await fetch(schwabUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 0 },
    })
  } catch (err) {
    console.error('[quotes] upstream fetch failed:', err)
    return NextResponse.json(
      { error: 'Failed to reach quote service' },
      { status: 502 }
    )
  }

  if (!schwabResponse.ok) {
    const status = schwabResponse.status
    const upstreamBody = await schwabResponse.text().catch(() => '')
    // Full upstream error always goes to the server log
    console.error(`[quotes] upstream error (${status}) for ${symbol}:`, upstreamBody)

    // Auth and server failures can mention our token or account setup — keep those generic
    if (status === 401 || status === 403 || status >= 500) {
      return NextResponse.json(
        { error: 'Quotes are temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // Other errors (bad request, rate limit, ...) are about the request, so pass Schwab's reason along
    let errorMessage = `Quote service error: ${status}`
    try {
      const errBody = JSON.parse(upstreamBody)
      if (errBody?.errors?.[0]?.detail) {
        const e = errBody.errors[0]
        errorMessage = e.source?.parameter ? `${e.detail}: ${e.source.parameter}` : e.detail
      } else if (errBody?.message) {
        errorMessage = errBody.message
      } else if (typeof errBody === 'string') {
        errorMessage = errBody
      }
    } catch {
      if (upstreamBody) errorMessage = `${errorMessage} ${upstreamBody}`
    }
    return NextResponse.json(
      { error: String(errorMessage).slice(0, MAX_ERROR_LENGTH) },
      { status }
    )
  }

  const raw = await schwabResponse.json()
  const filtered = filterOptionChain(raw as Record<string, unknown>)

  // Let Netlify's CDN serve repeat requests for the same chain for a few seconds, so
  // popular symbols (or a scraper hammering one) don't each cost a Schwab API call.
  // Only successful responses get this header, so errors are never cached.
  return NextResponse.json(filtered, {
    headers: {
      // No stale-while-revalidate: a quote is never served older than CDN_CACHE_SECONDS
      'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${CDN_CACHE_SECONDS}`,
      // The cache key must include these, or one symbol's chain would be served for another.
      // Any other query params are ignored, so random params can't be used to bypass the cache.
      // Varying on Sec-Fetch-Site keeps requests without it from being answered from the cache,
      // so they reach the same-site check above.
      'Netlify-Vary': 'query=symbols|contractType|strikeCount,header=Sec-Fetch-Site',
    },
  })
}
