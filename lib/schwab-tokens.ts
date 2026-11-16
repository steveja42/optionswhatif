import { getStore } from '@netlify/blobs'

const STORE_NAME = 'auth'
const TOKEN_KEY = 'schwab-tokens'

// 60-second buffer before expiry
const EXPIRY_BUFFER_MS = 60_000

export interface SchwabTokens {
  access_token: string
  refresh_token: string
  expires_in: number       // seconds
  token_type: string
  scope?: string
  id_token?: string
  issued_at: number        // ms epoch when the current ACCESS token was issued — we store this ourselves
  // ms epoch of the last interactive login (OAuth callback). Schwab's refresh token
  // expires 7 days after this, no matter how many times the access token is refreshed.
  // Optional only because tokens stored before this field existed don't have it.
  refresh_issued_at?: number
}

// Schwab refresh tokens hard-expire 7 days after the interactive login
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** When the last interactive login happened (falls back to issued_at for older stored tokens). */
export function getRefreshIssuedAt(tokens: SchwabTokens): number {
  return tokens.refresh_issued_at ?? tokens.issued_at
}

export function getRefreshTokenExpiresAt(tokens: SchwabTokens): number {
  return getRefreshIssuedAt(tokens) + REFRESH_TOKEN_TTL_MS
}

function getTokenStore() {
  return getStore(STORE_NAME)
}

export async function getTokens(): Promise<SchwabTokens | null> {
  const store = getTokenStore()
  const raw = await store.get(TOKEN_KEY, { type: 'json' })
  return raw as SchwabTokens | null
}

export async function saveTokens(tokens: SchwabTokens): Promise<void> {
  const store = getTokenStore()
  await store.setJSON(TOKEN_KEY, tokens)
}

/**
 * Returns a valid Schwab access token, refreshing if needed.
 * In local dev, if TOKEN_RELAY_SECRET is set, fetches from production instead of local Blobs.
 * Throws if refresh fails (caller should return 401).
 */
export async function getValidAccessToken(): Promise<string> {
  const relaySecret = process.env.TOKEN_RELAY_SECRET
  const productionUrl = process.env.PRODUCTION_URL

  if (process.env.NODE_ENV === 'development' && relaySecret && productionUrl) {
    const response = await fetch(`${productionUrl}/api/auth/schwab/tokens`, {
      headers: { Authorization: `Bearer ${relaySecret}` },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Token relay failed (${response.status}): ${text}`)
    }
    const data = await response.json()
    return data.access_token
  }

  const tokens = await getTokens()

  if (!tokens) {
    throw new Error('No Schwab tokens stored. Complete OAuth setup at /api/auth/schwab/login')
  }

  const expiresAt = tokens.issued_at + tokens.expires_in * 1000
  const stillValid = Date.now() < expiresAt - EXPIRY_BUFFER_MS

  if (stillValid) {
    return tokens.access_token
  }

  // Token expired — refresh it
  const newTokens = await refreshAccessToken(tokens.refresh_token)
  await saveTokens({
    ...newTokens,
    // Keep the original login time and refresh token unless Schwab sent a new one
    refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
    // Left undefined for older tokens so the admin page keeps flagging them until a re-login
    refresh_issued_at: tokens.refresh_issued_at,
  })
  return newTokens.access_token
}

async function refreshAccessToken(refreshToken: string): Promise<SchwabTokens> {
  const apiKey = process.env.SCHWAB_API_KEY
  const apiSecret = process.env.SCHWAB_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('SCHWAB_API_KEY or SCHWAB_API_SECRET not configured')
  }

  const encoded = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const response = await fetch('https://api.schwabapi.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encoded}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Schwab token refresh failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  return {
    ...data,
    issued_at: Date.now(),
  } as SchwabTokens
}
