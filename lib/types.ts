// Shared types for option chain data — mirrors the original owicomponents.tsx interfaces

export interface OptionPriceInfo {
  putCall: string
  symbol: string
  description: string
  exchangeName: string
  bid: number
  ask: number
  last: number
  mark: number
  bidSize: number
  askSize: number
  bidAskSize: string
  lastSize: number
  highPrice: number
  lowPrice: number
  openPrice: number
  closePrice: number
  totalVolume: number
  tradeDate?: string
  tradeTimeInLong: number
  quoteTimeInLong: number
  netChange: number
  volatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
  openInterest: number
  timeValue: number
  theoreticalOptionValue: number
  theoreticalVolatility: number
  optionDeliverablesList?: string
  strikePrice: number
  expirationDate: number
  daysToExpiration: number
  expirationType: string
  lastTradingDay: number
  multiplier: number
  settlementType: string
  deliverableNote: string
  isIndexOption?: string
  percentChange: number
  markChange: number
  markPercentChange: number
  inTheMoney: boolean
  mini: boolean
  nonStandard: boolean
}

export interface PriceMap {
  [price: string]: OptionPriceInfo[]
}

export interface ExpirationDateMap {
  [expDate: string]: PriceMap
}

export interface OptionChain {
  symbol: string
  status: string
  underlying: {
    symbol: string
    description: string
    change: number
    percentChange: number
    close: number
    quoteTime: number
    tradeTime: number
    bid: number
    ask: number
    last: number
    mark: number
    markChange: number
    markPercentChange: number
    bidSize: number
    askSize: number
    highPrice: number
    lowPrice: number
    openPrice: number
    totalVolume: number
    exchangeName: string
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    delayed: boolean
  }
  strategy: string
  interval: number
  isDelayed: boolean
  isIndex: boolean
  interestRate: number
  underlyingPrice: number
  volatility: number
  daysToExpiration: number
  numberOfContracts: number
  putExpDateMap?: ExpirationDateMap
  callExpDateMap?: ExpirationDateMap
}

export type OptionChainN = OptionChain | null

export type OptionTypes = 'PUT' | 'CALL'
export type BuySell = 'BUY' | 'SELL'
export type Strategy = 'single' | 'straddle'
export type ComboType = 'PUT' | 'CALL' | 'straddle'
