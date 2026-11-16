import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/** HttpOnly cookie holding the OAuth `state` between the login and callback routes. */
export const OAUTH_STATE_COOKIE = 'owi_oauth_state'

/** Constant-time string comparison (hashing first so lengths always match). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

/**
 * HTTP Basic auth for admin-only routes, checked against ADMIN_PASSWORD (any username).
 * Returns a 401 response to send back, or null if the request is authorized.
 * Fails closed: if ADMIN_PASSWORD is not set, nobody gets in.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD
  if (password) {
    const header = request.headers.get('authorization') ?? ''
    if (header.startsWith('Basic ')) {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
      const supplied = decoded.slice(decoded.indexOf(':') + 1)
      if (safeEqual(supplied, password)) return null
    }
  } else {
    console.error('[admin-auth] ADMIN_PASSWORD is not set — rejecting admin request')
  }
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="owiadmin", charset="UTF-8"' },
  })
}
