import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  const apiKey = process.env.SCHWAB_API_KEY
  const redirectUri = process.env.SCHWAB_REDIRECT_URI

  if (!apiKey || !redirectUri) {
    return NextResponse.json(
      { error: 'SCHWAB_API_KEY or SCHWAB_REDIRECT_URI not configured' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: apiKey,
    redirect_uri: redirectUri,
    scope: 'readonly',
  })

  // Fire-and-forget GoatCounter event so we can see who triggered a login
  const ip =
    _request.headers.get('x-forwarded-for') ??
    _request.headers.get('x-real-ip') ??
    ''
  fetch(`https://owi-next.goatcounter.com/count?p=%2Fschwab-login&t=Schwab+Login`, {
    headers: {
      'User-Agent': _request.headers.get('user-agent') ?? 'unknown',
      'X-Forwarded-For': ip,
    },
  }).catch(() => {/* ignore — don't block the redirect */})

  const authUrl = `https://api.schwabapi.com/v1/oauth/authorize?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
