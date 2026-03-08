import { NextRequest, NextResponse } from 'next/server'

// Basic feedback endpoint — logs server-side.
// Replace with your preferred email/storage backend.
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log server-side (visible in Netlify function logs)
  console.log('[feedback]', JSON.stringify(body))

  return NextResponse.json({ ok: true })
}
