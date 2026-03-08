'use client'

import { OptionChainN } from '@/lib/types'
import { currencyFormat } from '@/lib/calculations'

interface StockInfoProps {
  data: OptionChainN
}

export function StockInfo({ data }: StockInfoProps) {
  if (!data) return null

  if (data.status !== 'SUCCESS') {
    return (
      <div>
        <h2>no option data found</h2>
      </div>
    )
  }

  const underlying = data.underlying
  return (
    <div>
      <h2 style={{ display: 'inline' }}>
        {underlying.symbol} :{currencyFormat(data.underlyingPrice)}
      </h2>{' '}
      <span>{underlying.description}</span>
    </div>
  )
}
