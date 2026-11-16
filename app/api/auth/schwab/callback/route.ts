import { NextRequest, NextResponse } from 'next/server'
import { saveTokens } from '@/lib/schwab-tokens'
import { OAUTH_STATE_COOKIE, safeEqual } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') ?? ''
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? ''

  // Only accept callbacks for a login started from the admin-protected login route
  if (!expectedState || !safeEqual(state, expectedState)) {
    return NextResponse.json({ error: 'Invalid or expired login attempt' }, { status: 400 })
  }

  if (error) {
    console.error('[callback] auth error:', error)
    return NextResponse.json({ error: 'Authorization was not completed' }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const apiKey = process.env.SCHWAB_API_KEY
  const apiSecret = process.env.SCHWAB_API_SECRET
  const redirectUri = process.env.SCHWAB_REDIRECT_URI

  if (!apiKey || !apiSecret || !redirectUri) {
    console.error('[callback] missing credentials in environment')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const encoded = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const response = await fetch('https://api.schwabapi.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encoded}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    console.error(`[callback] token exchange failed (${response.status}):`, await response.text())
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 502 })
  }

  const data = await response.json()
  const now = Date.now()
  await saveTokens({ ...data, issued_at: now, refresh_issued_at: now })

  const origin = new URL(redirectUri).origin
  const redirect = NextResponse.redirect(new URL('/owiadmin', origin))
  redirect.cookies.delete({ name: OAUTH_STATE_COOKIE, path: '/api/auth' })
  return redirect
}
