// All financial calculation logic — copied exactly from the original owicomponents.tsx.
// DO NOT modify any formula or business logic.

export type ComboType = 'PUT' | 'CALL' | 'straddle'

export const pricePointPercentages = [0.1, 0.33, 0.5, 0.66, 0.9, 1]

/**
 * Returns the profit at a price point.
 * Exact copy of original getProfit() from owicomponents.tsx.
 */
export function getProfit(
  pricePoint: number,
  price: number,
  strike: number,
  type: ComboType,
  amBuying: boolean
): number {
  let profit: number
  switch (type) {
    case 'PUT':
      if (amBuying) profit = strike - price - pricePoint
      else profit = pricePoint > strike ? price : Math.max(price - (strike - pricePoint), 0)
      break
    case 'CALL':
      if (amBuying) profit = pricePoint - (strike + price)
      else profit = pricePoint < strike ? price : Math.max(price - (pricePoint - strike), 0)
      break
    case 'straddle':
      if (pricePoint >= strike) profit = pricePoint - (strike + price)
      else profit = strike - price - pricePoint
      break
    default:
      throw new TypeError(`unrecognized type ${type}`)
  }
  if (amBuying && profit < -price) profit = -price
  return profit
}

/**
 * Returns array of the default price points.
 * Exact copy of original getDefaultPricePoints() from owicomponents.tsx.
 */
export function getDefaultPricePoints(underlyingPrice: number, type: ComboType): string[] {
  return pricePointPercentages.map(percentChange => {
    let pricePoint: number
    switch (type) {
      case 'PUT':
        pricePoint = underlyingPrice * (1 - percentChange)
        break
      case 'CALL':
      case 'straddle':
        pricePoint = underlyingPrice * (1 + percentChange)
        break
      default:
        throw new TypeError(`unrecognized type ${type}`)
    }
    return currencyFormat(pricePoint)
  })
}

export function currencyFormat(num: number): string {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export function percentFormat(num: number): string {
  return num.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 })
}

export function parseLocaleNumber(str: string): number {
  // Detect the user's locale decimal separator
  const decimalSeparator = (1.1).toLocaleString().substring(1, 2)
  // Detect the user's locale thousand separator
  let thousandSeparator = (1000).toLocaleString().substring(1, 2)
  // In case there are locales that don't use a thousand separator
  if (thousandSeparator.match(/\d/)) thousandSeparator = ''

  const decSep = decimalSeparator === '.' ? '/.' : decimalSeparator
  const thouSep = thousandSeparator === '.' ? '/.' : thousandSeparator

  let result = str
  if (thouSep) result = result.replace(new RegExp(thouSep, 'g'), '')
  result = result.replace(new RegExp(decSep), '.')

  return parseFloat(result)
}
