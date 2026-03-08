'use client'

import { OptionPriceInfo, OptionChainN, ComboType } from '@/lib/types'
import {
  getProfit,
  currencyFormat,
  percentFormat,
  parseLocaleNumber,
} from '@/lib/calculations'

const optionDataFields = ['bid', 'ask', 'last'] as const
const legDataFields = ['bid', 'ask', 'totalVolume'] as const

interface OptionRowProps {
  strike: string
  data: OptionChainN
  type: ComboType
  amBuying: boolean
  put: OptionPriceInfo
  call: OptionPriceInfo
  pricePoints: string[]
}

export function OptionRow({ strike, data, type, amBuying, put, call, pricePoints }: OptionRowProps) {
  if (!data) return null

  let leftPart: React.ReactNode[] = []
  const coreVals: React.ReactNode[] = []
  let breakeven = 0
  let option: OptionPriceInfo
  let price: number
  let i = 0

  switch (type) {
    case 'straddle': {
      option = put
      for (const field of legDataFields) {
        leftPart.push(<td key={i++}>{option[field as keyof OptionPriceInfo] as React.ReactNode}</td>)
      }
      const bid = put.bid + call.bid
      const ask = put.ask + call.ask
      price = (ask - bid) / 2 + bid
      breakeven = Number(strike) - price
      leftPart.push(<td key={i++}>{currencyFormat(breakeven)}</td>)

      coreVals.push(<td key={i++}>{currencyFormat(bid)}</td>)
      coreVals.push(<td key={i++}>{currencyFormat(ask)}</td>)
      coreVals.push(<td key={i++} className="sectionborder">{currencyFormat(price)}</td>)

      option = call
      for (const field of legDataFields) {
        coreVals.push(<td key={i++}>{option[field as keyof OptionPriceInfo] as React.ReactNode}</td>)
      }
      breakeven = Number(strike) + price
      coreVals.push(<td key={i++}>{currencyFormat(breakeven)}</td>)
      break
    }
    default: {
      option = type === 'PUT' ? put : call
      price = (option.ask - option.bid) / 2 + option.bid
      if (type === 'PUT') breakeven = Number(strike) - price
      else breakeven = Number(strike) + price

      for (const fieldName of optionDataFields) {
        coreVals.push(<td key={i++}>{option[fieldName as keyof OptionPriceInfo] as React.ReactNode}</td>)
      }
      coreVals.push(<td key={i++}>{currencyFormat(price)}</td>)
      coreVals.push(<td key={i++}>{currencyFormat(breakeven)}</td>)
    }
  }

  const profitsPart: React.ReactNode[] = []
  let j = 0
  for (const pricePoint of pricePoints) {
    const profit = getProfit(parseLocaleNumber(pricePoint), price, Number(strike), type, amBuying)
    const roi = profit / price
    profitsPart.push(
      <td key={`profit${j}`} className="leftborder">
        {currencyFormat(profit)}
      </td>
    )
    profitsPart.push(<td key={`roi${j++}`}>{percentFormat(roi)}</td>)
  }

  return (
    <tr>
      {leftPart}
      <td className="colborder">{strike}</td>
      {coreVals}
      {profitsPart}
    </tr>
  )
}
