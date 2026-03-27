import { OptionChain, OptionPriceInfo } from './types'

const now = Date.now()
const price = 195.89

function makeOption(
  putCall: 'PUT' | 'CALL',
  strike: number,
  daysToExp: number,
  expDate: string
): OptionPriceInfo {
  const inTheMoney = putCall === 'PUT' ? strike > price : strike < price
  const intrinsic = inTheMoney
    ? putCall === 'PUT' ? strike - price : price - strike
    : 0
  const timeVal = +(Math.random() * 2 + 0.5).toFixed(2)
  const mid = +(intrinsic + timeVal).toFixed(2)
  const bid = +(mid - 0.05).toFixed(2)
  const ask = +(mid + 0.05).toFixed(2)

  return {
    putCall,
    symbol: `AAPL ${expDate.slice(0, 10).replace(/-/g, '')}${putCall[0]}${strike * 1000}`,
    description: `AAPL ${expDate.slice(0, 10)} ${strike} ${putCall}`,
    exchangeName: 'OPR',
    bid,
    ask,
    last: mid,
    mark: mid,
    bidSize: 10,
    askSize: 10,
    bidAskSize: '10X10',
    lastSize: 1,
    highPrice: +(mid + 0.3).toFixed(2),
    lowPrice: +(mid - 0.3).toFixed(2),
    openPrice: mid,
    closePrice: mid,
    totalVolume: Math.floor(Math.random() * 5000 + 100),
    tradeTimeInLong: now - 60000,
    quoteTimeInLong: now,
    netChange: +(Math.random() * 0.4 - 0.2).toFixed(2),
    volatility: +(Math.random() * 10 + 20).toFixed(4),
    delta: putCall === 'CALL'
      ? +(inTheMoney ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3).toFixed(4)
      : -(inTheMoney ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3).toFixed(4),
    gamma: +(Math.random() * 0.05).toFixed(4),
    theta: -(Math.random() * 0.1 + 0.01).toFixed(4),
    vega: +(Math.random() * 0.2).toFixed(4),
    rho: +(Math.random() * 0.05).toFixed(4),
    openInterest: Math.floor(Math.random() * 10000 + 500),
    timeValue: timeVal,
    theoreticalOptionValue: mid,
    theoreticalVolatility: 0,
    strikePrice: strike,
    expirationDate: now + daysToExp * 86400000,
    daysToExpiration: daysToExp,
    expirationType: 'R',
    lastTradingDay: now + daysToExp * 86400000,
    multiplier: 100,
    settlementType: ' ',
    deliverableNote: '',
    percentChange: +(Math.random() * 4 - 2).toFixed(2),
    markChange: +(Math.random() * 0.4 - 0.2).toFixed(2),
    markPercentChange: +(Math.random() * 4 - 2).toFixed(2),
    inTheMoney,
    mini: false,
    nonStandard: false,
  }
}

function makePriceMap(putCall: 'PUT' | 'CALL', strikes: number[], daysToExp: number, expDate: string) {
  const map: Record<string, OptionPriceInfo[]> = {}
  for (const strike of strikes) {
    map[String(strike)] = [makeOption(putCall, strike, daysToExp, expDate)]
  }
  return map
}

const strikes = [180, 185, 190, 192.5, 195, 197.5, 200, 205, 210]

// Two expiration dates: ~1 week out and ~1 month out
const exp1Date = new Date(now + 7 * 86400000)
const exp2Date = new Date(now + 30 * 86400000)

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

const exp1Key = `${fmt(exp1Date)}:7`
const exp2Key = `${fmt(exp2Date)}:30`

export const mockOptionChain: OptionChain = {
  symbol: 'AAPL',
  status: 'SUCCESS',
  underlying: {
    symbol: 'AAPL',
    description: 'Apple Inc. (MOCK DATA)',
    change: 1.23,
    percentChange: 0.63,
    close: 194.66,
    quoteTime: now,
    tradeTime: now,
    bid: 195.87,
    ask: 195.91,
    last: price,
    mark: price,
    markChange: 1.23,
    markPercentChange: 0.63,
    bidSize: 2,
    askSize: 3,
    highPrice: 197.2,
    lowPrice: 193.5,
    openPrice: 194.1,
    totalVolume: 52_340_000,
    exchangeName: 'NASDAQ',
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08,
    delayed: false,
  },
  strategy: 'SINGLE',
  interval: 0,
  isDelayed: false,
  isIndex: false,
  interestRate: 5.3,
  underlyingPrice: price,
  volatility: 29.5,
  daysToExpiration: 0,
  numberOfContracts: strikes.length * 2 * 2,
  putExpDateMap: {
    [exp1Key]: makePriceMap('PUT', strikes, 7, fmt(exp1Date)),
    [exp2Key]: makePriceMap('PUT', strikes, 30, fmt(exp2Date)),
  },
  callExpDateMap: {
    [exp1Key]: makePriceMap('CALL', strikes, 7, fmt(exp1Date)),
    [exp2Key]: makePriceMap('CALL', strikes, 30, fmt(exp2Date)),
  },
}
