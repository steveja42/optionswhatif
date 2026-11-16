import { getStore } from '@netlify/blobs'
import {
  getTokens,
  getValidAccessToken,
  getRefreshIssuedAt,
  getRefreshTokenExpiresAt,
} from './schwab-tokens'
import { sendPhoneNotification, type PhoneNotification } from './notify'

const STATE_KEY = 'schwab-reminder-state'
const HOUR_MS = 60 * 60 * 1000

export type AlertKey = 'expires_24h' | 'expires_2h' | 'expired' | 'refresh_failed' | 'no_tokens'

interface ReminderState {
  /** Login the `sent` list applies to — a new login resets it */
  refreshIssuedAt: number
  sent: AlertKey[]
}

/**
 * Picks which expiry alert (if any) is due. Only the most urgent one that's due is sent;
 * the less urgent ones are marked as sent with it so they don't fire afterwards.
 */
export function pickExpiryAlert(
  msLeft: number,
  sent: readonly AlertKey[]
): { send: AlertKey; markSent: AlertKey[] } | null {
  const ladder: { key: AlertKey; dueAtMsLeft: number }[] = [
    { key: 'expired', dueAtMsLeft: 0 },
    { key: 'expires_2h', dueAtMsLeft: 2 * HOUR_MS },
    { key: 'expires_24h', dueAtMsLeft: 24 * HOUR_MS },
  ]
  const idx = ladder.findIndex(step => msLeft <= step.dueAtMsLeft)
  if (idx === -1) return null
  const due = ladder[idx].key
  if (sent.includes(due)) return null
  return { send: due, markSent: ladder.slice(idx).map(step => step.key) }
}

export function formatTimeLeft(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function loginUrl(): string | undefined {
  const redirectUri = process.env.SCHWAB_REDIRECT_URI
  return redirectUri ? `${new URL(redirectUri).origin}/api/auth/schwab/login` : undefined
}

function buildNotification(key: AlertKey, msLeft: number, detail?: string): PhoneNotification {
  const base = { clickUrl: loginUrl(), actionLabel: 'Re-authorize' }
  switch (key) {
    case 'expires_24h':
      return {
        ...base,
        title: `Schwab login expires in ${formatTimeLeft(msLeft)}`,
        message: 'Option quotes on OptionsWhatIf will stop working when it expires. Tap to re-authorize with Schwab.',
        priority: 'default',
        tags: ['hourglass_flowing_sand'],
      }
    case 'expires_2h':
      return {
        ...base,
        title: `Schwab login expires in ${formatTimeLeft(msLeft)}`,
        message: 'Last reminder before quotes stop working. Tap to re-authorize with Schwab.',
        priority: 'high',
        tags: ['warning'],
      }
    case 'expired':
      return {
        ...base,
        title: 'Schwab login expired - quotes are down',
        message: 'The 7-day Schwab refresh token has expired. Option quotes are failing until you re-authorize.',
        priority: 'urgent',
        tags: ['rotating_light'],
      }
    case 'refresh_failed':
      return {
        ...base,
        title: 'Schwab token refresh failed - quotes are down',
        message:
          'Schwab rejected the refresh token before its 7 days were up (e.g. a login from another environment replaced it). ' +
          `Tap to re-authorize.${detail ? `\n\n${detail.slice(0, 300)}` : ''}`,
        priority: 'urgent',
        tags: ['rotating_light'],
      }
    case 'no_tokens':
      return {
        ...base,
        title: 'No Schwab tokens stored',
        message: 'OptionsWhatIf has no Schwab tokens, so quotes are down. Tap to authorize.',
        priority: 'urgent',
        tags: ['rotating_light'],
      }
  }
}

/**
 * Checks the stored Schwab tokens and sends phone alerts when the refresh token is close to
 * expiring, has expired, or can no longer be used. Each alert is sent once per login.
 * Run on a schedule (see netlify/functions/schwab-token-reminder.mts).
 */
export async function checkTokensAndNotify(now = Date.now()): Promise<string> {
  const store = getStore('auth')
  const tokens = await getTokens()
  const refreshIssuedAt = tokens ? getRefreshIssuedAt(tokens) : 0

  const saved = (await store.get(STATE_KEY, { type: 'json' })) as ReminderState | null
  const state: ReminderState =
    saved && saved.refreshIssuedAt === refreshIssuedAt ? saved : { refreshIssuedAt, sent: [] }

  async function alertOnce(key: AlertKey, markSent: AlertKey[], msLeft: number, detail?: string) {
    if (state.sent.includes(key)) return `${key} already sent`
    const ok = await sendPhoneNotification(buildNotification(key, msLeft, detail))
    if (!ok) return `${key} notification failed (will retry next run)`
    state.sent = Array.from(new Set([...state.sent, ...markSent]))
    await store.setJSON(STATE_KEY, state)
    return `${key} sent`
  }

  if (!tokens) return alertOnce('no_tokens', ['no_tokens'], 0)

  const msLeft = getRefreshTokenExpiresAt(tokens) - now
  const results: string[] = [`refresh token: ${formatTimeLeft(msLeft)} left`]

  const expiryAlert = pickExpiryAlert(msLeft, state.sent)
  if (expiryAlert) results.push(await alertOnce(expiryAlert.send, expiryAlert.markSent, msLeft))

  // Also catch the token being rejected early. Only refreshes if the access token has expired.
  if (msLeft > 0) {
    try {
      await getValidAccessToken()
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      results.push(await alertOnce('refresh_failed', ['refresh_failed'], msLeft, detail))
    }
  }

  return results.join('; ')
}
