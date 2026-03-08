'use client'

import { OptionChainN, ComboType } from '@/lib/types'
import { OptionExpiration } from './OptionExpiration'

interface OptionExpirationsProps {
  data: OptionChainN
  dates: string[]
  type: ComboType
  amBuying: boolean
}

export function OptionExpirations({ data, dates, type, amBuying }: OptionExpirationsProps) {
  if (!data || (data.putExpDateMap && (!dates || dates.length === 0))) {
    return null
  }

  if (!data.putExpDateMap) return null

  const expDates = dates.map(date => (
    <OptionExpiration
      key={date}
      title={date.slice(0, 10)}
      data={data}
      type={type}
      date={date}
      amBuying={amBuying}
    />
  ))

  return <div>{expDates}</div>
}
