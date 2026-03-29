'use client'

import { useState } from 'react'
import { OptionChainN, ComboType } from '@/lib/types'
import { getDefaultPricePoints, parseLocaleNumber, currencyFormat } from '@/lib/calculations'
import { OptionRow } from './OptionRow'

interface OptionExpirationProps {
  title: string
  data: OptionChainN
  date: string
  type: ComboType
  amBuying: boolean
}

const coreHeaders = ['Strike', 'Bid', 'Ask', 'Last', 'Price', 'Breakeven']
const straddleHeaders = ['Bid', 'Ask', 'Vol', 'Breakeven', 'Strike', 'Bid', 'Ask', 'Price', 'Bid', 'Ask', 'Vol', 'Breakeven']
const profitHeaders = ['Profit', 'ROI', 'Profit', 'ROI', 'Profit', 'ROI', 'Profit', 'ROI', 'Profit', 'ROI', 'Profit', 'ROI']
const ppStraddleHeaders = ['Puts', '', '', '', '', 'Straddle', '', '', 'Calls', '', '', '']
const ppSingleHeaders = ['', '', '', '', '', '']

export function OptionExpiration({ title, data, date, type, amBuying }: OptionExpirationProps) {
  const underlyingPrice = Number(data?.underlying?.last)
  const [pricePoints, setPricePoints] = useState(getDefaultPricePoints(underlyingPrice, type))
  const [previousType, setPreviousType] = useState(type)

  if (!data) return null

  if (previousType !== type) {
    setPreviousType(type)
    setPricePoints(getDefaultPricePoints(underlyingPrice, type))
  }

  const updateElement: React.ChangeEventHandler<HTMLInputElement> = event => {
    const ppCopy = [...pricePoints]
    ppCopy[Number(event.target.name)] = event.target.value
    setPricePoints(ppCopy)
  }

  const preHeaders = type !== 'straddle'
    ? ['', '', '', '', '', '', 'If Price Goes to']
    : ['', '', '', '', '', '', '', '', '', '', '', '', 'If Price Goes to']

  // Pre-header row
  let i = 0
  const preHeaderRow = preHeaders.map(x => <th key={i++} className="noborder">{x}</th>)

  // Core header row
  let j = 0
  let corePart: React.ReactNode[]
  if (type === 'straddle') {
    corePart = straddleHeaders.map(headerName => (
      <th key={j++} className={headerName === 'Strike' ? 'colborder' : j === 7 ? 'sectionborder' : undefined}>
        {headerName}
      </th>
    ))
  } else {
    corePart = coreHeaders.map(headerName => (
      <th key={j++} className={headerName === 'Strike' ? 'colborder' : undefined}>
        {headerName}
      </th>
    ))
  }
  const profitsPart = profitHeaders.map(x => (
    <th key={x + j++} className={x === 'Profit' ? 'leftborder' : undefined}>
      {x}
    </th>
  ))

  // Price points header
  let k = 0
  let ppCorePart: React.ReactNode[]
  if (type === 'straddle') {
    ppCorePart = ppStraddleHeaders.map(x => (
      <th key={k++} className={k === 7 ? 'sectionborder' : k === 4 ? 'colborder' : undefined}>{x}</th>
    ))
  } else {
    ppCorePart = ppSingleHeaders.map(x => (
      <th key={k++} className={k === 0 ? 'colborder' : undefined}>{x}</th>
    ))
  }

  let pp = 0
  const ppPart: React.ReactNode[] = []
  for (const pricePoint of pricePoints) {
    const priceChange = parseLocaleNumber(pricePoint) / underlyingPrice - 1
    ppPart.push(
      <th key={k++} className="leftborder">
        <input
          name={pp.toString()}
          type="text"
          value={pricePoints[pp]}
          onChange={updateElement}
          className="pp"
          placeholder="Enter #"
        />
      </th>
    )
    pp++
    ppPart.push(
      <th key={k++}>
        ({priceChange.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 0 })} change)
      </th>
    )
  }

  const putDateMap = data.putExpDateMap?.[date]
  if (!putDateMap) return null

  const priceRows = Object.entries(putDateMap).map(([strike, value]) => (
    <OptionRow
      key={strike}
      strike={strike}
      data={data}
      type={type}
      amBuying={amBuying}
      put={value[0]}
      pricePoints={pricePoints}
      call={data.callExpDateMap?.[date]?.[strike]?.[0]!}
    />
  ))

  return (
    <div>
      <h4>{`${title} ${type}'s`}</h4>
      <table id="stocktable" className="stocktable">
        <thead><tr>{preHeaderRow}</tr></thead>
        <thead><tr>{ppCorePart}{ppPart}</tr></thead>
        <thead><tr>{corePart}{profitsPart}</tr></thead>
        <tbody>{priceRows}</tbody>
      </table>
    </div>
  )
}
