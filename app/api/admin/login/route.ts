import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { OAUTH_STATE_COOKIE, requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const apiKey = process.env.SCHWAB_API_KEY
  const redirectUri = process.env.SCHWAB_REDIRECT_URI

  if (!apiKey || !redirectUri) {
    console.error('[login] SCHWAB_API_KEY or SCHWAB_REDIRECT_URI not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  // Random state ties the callback to this login, so nobody can push their own
  // authorization code into our callback and overwrite the stored tokens.
  const state = randomBytes(32).toString('base64url')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: apiKey,
    redirect_uri: redirectUri,
    scope: 'readonly',
    state,
  })

  // Fire-and-forget GoatCounter event so we can see who triggered a login
  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    ''
  fetch(`https://owi-next.goatcounter.com/count?p=%2Fschwab-login&t=Schwab+Login`, {
    headers: {
      'User-Agent': request.headers.get('user-agent') ?? 'unknown',
      'X-Forwarded-For': ip,
    },
  }).catch(() => {/* ignore — don't block the redirect */})

  const authUrl = `https://api.schwabapi.com/v1/oauth/authorize?${params.toString()}`
  const response = NextResponse.redirect(authUrl)
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax', // must survive the top-level redirect back from Schwab
    path: '/api/auth',
    maxAge: 600,
  })
  return response
}
