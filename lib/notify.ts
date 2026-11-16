/**
 * Phone push notifications via ntfy (https://ntfy.sh).
 *
 * Setup: install the ntfy app (iOS/Android), subscribe to a hard-to-guess topic name,
 * and set the same name in the NTFY_TOPIC env var (server-side only). Anyone who knows
 * the topic name can read it, so never put secrets in notification text.
 */

export type NotifyPriority = 'min' | 'low' | 'default' | 'high' | 'urgent'

export interface PhoneNotification {
  title: string
  message: string
  priority?: NotifyPriority
  /** ntfy tags; names matching emoji shortcodes (e.g. "warning") show as emoji */
  tags?: string[]
  /** Opened when the notification is tapped; also shown as an action button */
  clickUrl?: string
  actionLabel?: string
}

/** Returns true if the notification was accepted by ntfy. Never throws. */
export async function sendPhoneNotification(n: PhoneNotification): Promise<boolean> {
  const topic = process.env.NTFY_TOPIC
  if (!topic) {
    console.warn('NTFY_TOPIC not set — skipping phone notification:', n.title)
    return false
  }
  const server = (process.env.NTFY_SERVER ?? 'https://ntfy.sh').replace(/\/+$/, '')

  // HTTP header values must be plain ASCII — keep emoji in tags/body, not the title
  const headers: Record<string, string> = {
    Title: n.title,
    Priority: n.priority ?? 'default',
  }
  if (n.tags?.length) headers.Tags = n.tags.join(',')
  if (n.clickUrl) {
    headers.Click = n.clickUrl
    headers.Actions = `view, ${n.actionLabel ?? 'Open'}, ${n.clickUrl}, clear=true`
  }

  try {
    const res = await fetch(`${server}/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers,
      body: n.message,
    })
    if (!res.ok) {
      console.error(`ntfy rejected notification (${res.status}): ${await res.text()}`)
      return false
    }
    return true
  } catch (err) {
    console.error('ntfy request failed:', err)
    return false
  }
}
