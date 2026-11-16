import { describe, expect, it } from 'vitest'
import { formatTimeLeft, pickExpiryAlert } from './token-reminder'

const H = 60 * 60 * 1000

describe('pickExpiryAlert', () => {
  it('sends nothing with more than 24h left', () => {
    expect(pickExpiryAlert(30 * H, [])).toBeNull()
  })

  it('sends the 24h reminder once', () => {
    expect(pickExpiryAlert(23 * H, [])).toEqual({ send: 'expires_24h', markSent: ['expires_24h'] })
    expect(pickExpiryAlert(20 * H, ['expires_24h'])).toBeNull()
  })

  it('sends the 2h reminder after the 24h one', () => {
    expect(pickExpiryAlert(1.5 * H, ['expires_24h'])).toEqual({
      send: 'expires_2h',
      markSent: ['expires_2h', 'expires_24h'],
    })
  })

  it('only sends the most urgent alert when earlier ones were missed', () => {
    expect(pickExpiryAlert(-5 * H, [])).toEqual({
      send: 'expired',
      markSent: ['expired', 'expires_2h', 'expires_24h'],
    })
    expect(pickExpiryAlert(-6 * H, ['expired', 'expires_2h', 'expires_24h'])).toBeNull()
  })
})

describe('formatTimeLeft', () => {
  it('formats hours and minutes', () => {
    expect(formatTimeLeft(23 * H + 40 * 60_000)).toBe('23h 40m')
    expect(formatTimeLeft(45 * 60_000)).toBe('45m')
    expect(formatTimeLeft(-H)).toBe('0m')
  })
})
