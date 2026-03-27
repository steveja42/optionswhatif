import { describe, it, expect } from 'vitest'
import { getProfit, getDefaultPricePoints, currencyFormat, percentFormat, parseLocaleNumber } from './calculations'

describe('getProfit', () => {
  describe('PUT buying', () => {
    it('returns full loss when price point is above strike', () => {
      // Buying a put at $5 with strike $100, price point $110 → max loss = -price
      expect(getProfit(110, 5, 100, 'PUT', true)).toBe(-5)
    })

    it('returns profit when price point is below strike', () => {
      // strike - price - pricePoint = 100 - 5 - 90 = 5
      expect(getProfit(90, 5, 100, 'PUT', true)).toBe(5)
    })

    it('returns loss at breakeven', () => {
      // strike - price - pricePoint = 100 - 5 - 100 = -5, clamped to -price
      expect(getProfit(100, 5, 100, 'PUT', true)).toBe(-5)
    })
  })

  describe('PUT selling', () => {
    it('keeps premium when price point is above strike', () => {
      // pricePoint(110) > strike(100) → return price(5)
      expect(getProfit(110, 5, 100, 'PUT', false)).toBe(5)
    })

    it('returns 0 when deeply below strike (max loss floors at 0)', () => {
      // Math.max(price - (strike - pricePoint), 0) = Math.max(5 - 15, 0) = 0
      expect(getProfit(85, 5, 100, 'PUT', false)).toBe(0)
    })

    it('returns zero at strike (max(price - 0, 0) = price when pricePoint=strike)', () => {
      expect(getProfit(100, 5, 100, 'PUT', false)).toBe(5)
    })
  })

  describe('CALL buying', () => {
    it('returns loss when price point is below strike', () => {
      // pricePoint(90) - (strike(100) + price(5)) = -15, clamped to -5
      expect(getProfit(90, 5, 100, 'CALL', true)).toBe(-5)
    })

    it('returns profit when price point is above strike', () => {
      // 115 - (100 + 5) = 10
      expect(getProfit(115, 5, 100, 'CALL', true)).toBe(10)
    })
  })

  describe('CALL selling', () => {
    it('keeps premium when price point is below strike', () => {
      expect(getProfit(90, 5, 100, 'CALL', false)).toBe(5)
    })

    it('returns 0 when deeply above strike (max loss floors at 0)', () => {
      // Math.max(price - (pricePoint - strike), 0) = Math.max(5 - 15, 0) = 0
      expect(getProfit(115, 5, 100, 'CALL', false)).toBe(0)
    })
  })

  describe('straddle', () => {
    it('profits when price point is well above strike', () => {
      // pricePoint(120) >= strike(100): 120 - (100 + 10) = 10
      expect(getProfit(120, 10, 100, 'straddle', true)).toBe(10)
    })

    it('profits when price point is well below strike', () => {
      // pricePoint(80) < strike(100): 100 - 10 - 80 = 10
      expect(getProfit(80, 10, 100, 'straddle', true)).toBe(10)
    })

    it('loses at the strike (max loss)', () => {
      // pricePoint(100) >= strike(100): 100 - (100 + 10) = -10
      expect(getProfit(100, 10, 100, 'straddle', true)).toBe(-10)
    })
  })

  it('throws on unrecognized type', () => {
    // @ts-expect-error testing invalid type
    expect(() => getProfit(100, 5, 100, 'UNKNOWN', true)).toThrow()
  })
})

describe('getDefaultPricePoints', () => {
  it('returns 7 price points', () => {
    expect(getDefaultPricePoints(100, 'PUT')).toHaveLength(7)
  })

  it('PUT price points go downward from underlying', () => {
    const pts = getDefaultPricePoints(200, 'PUT').map(parseLocaleNumber)
    expect(pts[0]).toBe(200) // 0% change
    expect(pts[pts.length - 1]).toBe(0) // 100% down? actually 1.0 * (1-1) = 0
    // all should be <= underlyingPrice
    pts.forEach(p => expect(p).toBeLessThanOrEqual(200.01))
  })

  it('CALL price points go upward from underlying', () => {
    const pts = getDefaultPricePoints(200, 'CALL').map(parseLocaleNumber)
    expect(pts[0]).toBe(200)
    pts.forEach(p => expect(p).toBeGreaterThanOrEqual(199.99))
  })

  it('straddle price points go upward like CALL', () => {
    const callPts = getDefaultPricePoints(200, 'CALL')
    const straddlePts = getDefaultPricePoints(200, 'straddle')
    expect(straddlePts).toEqual(callPts)
  })
})

describe('currencyFormat', () => {
  it('formats to 2 decimal places', () => {
    expect(currencyFormat(1234.5)).toMatch(/1,234\.50|1\.234,50/)
  })

  it('does not exceed 2 decimal places', () => {
    const result = currencyFormat(1.123456)
    const decimalPart = result.split(/[.,]/).pop() ?? ''
    expect(decimalPart.length).toBeLessThanOrEqual(2)
  })
})

describe('percentFormat', () => {
  it('formats as percentage', () => {
    const result = percentFormat(0.1234)
    expect(result).toMatch(/12/)
    expect(result).toContain('%')
  })
})

describe('parseLocaleNumber', () => {
  it('parses a simple number string', () => {
    expect(parseLocaleNumber('123.45')).toBeCloseTo(123.45)
  })

  it('round-trips with currencyFormat', () => {
    const original = 1234.56
    const formatted = currencyFormat(original)
    const parsed = parseLocaleNumber(formatted)
    expect(parsed).toBeCloseTo(original, 1)
  })
})
