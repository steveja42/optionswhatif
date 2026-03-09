import { NextResponse } from 'next/server'
import { getTokens } from '@/lib/schwab-tokens'

export async function GET() {
  const tokens = await getTokens()

  if (!tokens) {
    return NextResponse.json({ status: 'no_tokens' })
  }

  const now = Date.now()
  const accessExpiresAt = tokens.issued_at + tokens.expires_in * 1000
  const accessExpiresIn = Math.floor((accessExpiresAt - now) / 1000)

  // Schwab refresh tokens expire after 7 days
  const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
  const refreshExpiresAt = tokens.issued_at + REFRESH_TOKEN_TTL_MS
  const refreshExpiresIn = Math.floor((refreshExpiresAt - now) / 1000)

  return NextResponse.json({
    status: refreshExpiresIn > 0 ? 'ok' : 'refresh_expired',
    issuedAt: new Date(tokens.issued_at).toISOString(),
    accessToken: {
      expiresAt: new Date(accessExpiresAt).toISOString(),
      expiresInSeconds: accessExpiresIn,
      expired: accessExpiresIn <= 0,
    },
    refreshToken: {
      expiresAt: new Date(refreshExpiresAt).toISOString(),
      expiresInSeconds: refreshExpiresIn,
      expired: refreshExpiresIn <= 0,
    },
  })
}
