import { NextResponse } from 'next/server'
import { getTokens, getRefreshIssuedAt, getRefreshTokenExpiresAt } from '@/lib/schwab-tokens'

export async function GET() {
  const tokens = await getTokens()

  if (!tokens) {
    return NextResponse.json({ status: 'no_tokens' })
  }

  const now = Date.now()
  const accessExpiresAt = tokens.issued_at + tokens.expires_in * 1000
  const accessExpiresIn = Math.floor((accessExpiresAt - now) / 1000)

  // Refresh token expiry is based on the last interactive login, not the last access-token refresh
  const refreshExpiresAt = getRefreshTokenExpiresAt(tokens)
  const refreshExpiresIn = Math.floor((refreshExpiresAt - now) / 1000)

  return NextResponse.json({
    status: refreshExpiresIn > 0 ? 'ok' : 'refresh_expired',
    issuedAt: new Date(getRefreshIssuedAt(tokens)).toISOString(),
    // false for tokens saved before login time was tracked — expiry shown may be too optimistic
    loginTimeKnown: tokens.refresh_issued_at !== undefined,
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
