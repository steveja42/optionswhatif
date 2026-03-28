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
  return recent.length > RATE_LIMIT_MAX
}

// --- Input validation ---
const SYMBOL_RE = /^[A-Z]{1,5}(:[A-Z]{1,5})?$/
const MAX_SYMBOLS = 5
const VALID_CONTRACT_TYPES = new Set(['CALL', 'PUT', 'ALL'])
const MAX_STRIKE_COUNT = 50

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
  // Rate limit by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

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

  // Mock mode — set USE_MOCK_DATA=true in .env.local to skip Schwab entirely
  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(mockOptionChain)
  }

  // Get valid access token (server-side only)
  let accessToken: string
  try {
    accessToken = await getValidAccessToken()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Auth error'
    // If no tokens stored, signal that OAuth setup is needed
    if (message.includes('No Schwab tokens')) {
      return NextResponse.json({ error: message, authRequired: true }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 401 })
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
    return NextResponse.json(
      { error: 'Failed to reach Schwab API' },
      { status: 502 }
    )
  }

  if (!schwabResponse.ok) {
    if (schwabResponse.status === 401) {
      return NextResponse.json(
        { error: 'Schwab authorization failed — token may need refresh', authRequired: true },
        { status: 401 }
      )
    }
    let errorMessage = `Schwab API error: ${schwabResponse.status}`
    try {
      const errBody = await schwabResponse.json()
      if (errBody?.errors?.[0]?.detail) {
        const e = errBody.errors[0]
        errorMessage = e.source?.parameter
          ? `${e.detail}: ${e.source.parameter}`
          : e.detail
      } else if (errBody?.message) {
        errorMessage = errBody.message
      } else if (typeof errBody === 'string') {
        errorMessage = errBody
      }
    } catch {}
    return NextResponse.json(
      { error: errorMessage },
      { status: schwabResponse.status >= 500 ? 502 : schwabResponse.status }
    )
  }

  const raw = await schwabResponse.json()
  const filtered = filterOptionChain(raw as Record<string, unknown>)

  return NextResponse.json(filtered)
}
