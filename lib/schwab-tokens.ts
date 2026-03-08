import { getStore } from '@netlify/blobs'

const STORE_NAME = 'auth'
const TOKEN_KEY = 'schwab-tokens'

// 60-second buffer before expiry
const EXPIRY_BUFFER_MS = 60_000

interface SchwabTokens {
  access_token: string
  refresh_token: string
  expires_in: number       // seconds
  token_type: string
  scope?: string
  id_token?: string
  issued_at: number        // ms epoch — we store this ourselves
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
 * Throws if refresh fails (caller should return 401).
 */
export async function getValidAccessToken(): Promise<string> {
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
  await saveTokens(newTokens)
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
