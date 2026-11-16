import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/schwab-tokens'
import { safeEqual } from '@/lib/admin-auth'

// Hands the live access token to local dev. A short secret could be brute-forced, so require a long one.
const MIN_SECRET_LENGTH = 32

export async function GET(request: NextRequest) {
  const secret = process.env.TOKEN_RELAY_SECRET
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const authHeader = request.headers.get('authorization') ?? ''
  if (!safeEqual(authHeader, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const access_token = await getValidAccessToken()
    return NextResponse.json({ access_token })
  } catch (err) {
    console.error('[tokens] relay failed:', err)
    return NextResponse.json({ error: 'Token unavailable' }, { status: 401 })
  }
}
