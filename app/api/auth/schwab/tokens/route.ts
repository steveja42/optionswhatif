import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/schwab-tokens'

export async function GET(request: NextRequest) {
  const secret = process.env.TOKEN_RELAY_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Token relay not configured' }, { status: 403 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const access_token = await getValidAccessToken()
    return NextResponse.json({ access_token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
