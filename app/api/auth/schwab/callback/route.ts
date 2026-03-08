import { NextRequest, NextResponse } from 'next/server'
import { saveTokens } from '@/lib/schwab-tokens'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json(
      { error: `Schwab auth error: ${error}` },
      { status: 400 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    )
  }

  const apiKey = process.env.SCHWAB_API_KEY
  const apiSecret = process.env.SCHWAB_API_SECRET
  const redirectUri = process.env.SCHWAB_REDIRECT_URI

  if (!apiKey || !apiSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing Schwab credentials in environment' },
      { status: 500 }
    )
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
    const text = await response.text()
    return NextResponse.json(
      { error: `Token exchange failed (${response.status}): ${text}` },
      { status: 502 }
    )
  }

  const data = await response.json()
  await saveTokens({ ...data, issued_at: Date.now() })

  return NextResponse.redirect(new URL('/', request.url))
}
