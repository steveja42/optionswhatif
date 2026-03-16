import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/schwab-tokens'

export async function GET() {
  try {
    const access_token = await getValidAccessToken()
    return NextResponse.json({ access_token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
