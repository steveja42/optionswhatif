'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OptionChainN, OptionTypes, BuySell, Strategy, ComboType } from '@/lib/types'
import { StockInfo } from './StockInfo'
import { OptionExpirations } from './OptionExpirations'
import { useState } from 'react'

function useUrlState() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const symbol = searchParams.get('symbol') ?? ''
  const strategy = (searchParams.get('strategy') ?? 'single') as Strategy
  const type = (searchParams.get('type') ?? 'PUT') as OptionTypes
  const buySell = (searchParams.get('buySell') ?? 'BUY') as BuySell
  const strikeCount = Number(searchParams.get('strikes') ?? 5)

  const push = useCallback(
    (updates: {
      symbol?: string
      strategy?: Strategy
      type?: OptionTypes
      buySell?: BuySell
      strikeCount?: number
    }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (updates.symbol !== undefined) {
        if (updates.symbol) params.set('symbol', updates.symbol.toUpperCase())
        else params.delete('symbol')
      }
      if (updates.strategy !== undefined) params.set('strategy', updates.strategy)
      if (updates.type !== undefined) params.set('type', updates.type)
      if (updates.buySell !== undefined) params.set('buySell', updates.buySell)
      if (updates.strikeCount !== undefined) params.set('strikes', String(updates.strikeCount))
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return { symbol, strategy, type, buySell, strikeCount, push }
}

export function OptionsWhatIf() {
  const { symbol, strategy, type, buySell, strikeCount, push } = useUrlState()

  const [dateOptions, setDateOptions] = useState<React.ReactNode[] | null>(null)
  const [datesSelected, setDatesSelected] = useState<string[]>([])
  const [data, setData] = useState<OptionChainN>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState<string | undefined>(undefined)

  const fetching = useRef(false)
  const timerID = useRef(0)

  // Track the symbol that was last fetched so we can re-fetch when URL symbol changes
  const lastFetchedSymbol = useRef('')
  const lastFetchedStrikeCount = useRef(0)

  useEffect(() => {
    return () => {
      if (timerID.current) clearInterval(timerID.current)
    }
  }, [])

  const areNoWrongExpirationDates = useCallback(
    (result: OptionChainN) => {
      if (result?.status === 'SUCCESS' && datesSelected) {
        const optionMap = result.putExpDateMap
        for (const date of datesSelected) {
          if (!optionMap?.[date]) return false
        }
      }
      return true
    },
    [datesSelected]
  )

  const setExpirationDates = useCallback((result: OptionChainN, optionType = type) => {
    if (!result) return
    void optionType // kept for API parity; putExpDateMap is used for date keys
    const optionMap = result.putExpDateMap
    const opts = optionMap
      ? Object.keys(optionMap).map(date => (
          <option key={date} value={date}>
            {date.slice(0, 10)}
          </option>
        ))
      : null
    setDateOptions(opts)
  }, [type])

  const getData = useCallback(
    async (sym = symbol, strikes = strikeCount): Promise<OptionChainN> => {
      if (!sym || fetching.current) return null
      fetching.current = true
      try {
        const params = new URLSearchParams({
          symbols: sym.toUpperCase(),
          contractType: 'ALL',
          strikeCount: String(strikes),
        })
        const response = await fetch(`/api/quotes?${params.toString()}`)

        if (!response.ok) {
          const json = await response.json().catch(() => ({}))
          const msg = json?.error ?? `Server error (${response.status})`
          setShowFailure(msg)
          return null
        }

        const result = await response.json()

        if (areNoWrongExpirationDates(result)) {
          setData(result)
          setShowFailure(undefined)
        } else {
          setShowFailure('got back invalid option date, please try again')
        }

        return result
      } catch (err) {
        setShowFailure(err instanceof Error ? err.message : String(err))
        return null
      } finally {
        fetching.current = false
      }
    },
    [symbol, strikeCount, areNoWrongExpirationDates]
  )

  const refreshExpirations = useCallback((dates = datesSelected) => {
    if (dates.length > 0) {
      setDatesSelected([])
      setTimeout(() => setDatesSelected(dates), 0)
    }
  }, [datesSelected])

  // When symbol is cleared (e.g. logo click resets to /), clear all local state
  useEffect(() => {
    if (!symbol) {
      if (timerID.current) clearInterval(timerID.current)
      timerID.current = 0
      lastFetchedSymbol.current = ''
      lastFetchedStrikeCount.current = 0
      setData(null)
      setDateOptions(null)
      setDatesSelected([])
      setShowSuccess(false)
      setShowFailure(undefined)
    }
  }, [symbol])

  // When URL symbol or strikeCount changes (including back/forward), fetch data
  useEffect(() => {
    if (
      symbol &&
      (symbol !== lastFetchedSymbol.current || strikeCount !== lastFetchedStrikeCount.current)
    ) {
      lastFetchedSymbol.current = symbol
      lastFetchedStrikeCount.current = strikeCount
      getData(symbol, strikeCount).then(result => {
        if (result) setExpirationDates(result, type)
        refreshExpirations()
      })
    }
  }, [symbol, strikeCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // When type changes via URL (back/forward), refresh expirations
  const prevType = useRef(type)
  useEffect(() => {
    if (prevType.current !== type) {
      prevType.current = type
      if (data) setExpirationDates(data, type)
      refreshExpirations()
    }
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  const changeSymbol = useCallback(
    (sym: string) => {
      const upper = sym.toUpperCase()
      if (!upper) return
      push({ symbol: upper, strategy, type, buySell, strikeCount })
      // fetch will be triggered by the URL change effect above
    },
    [push, strategy, type, buySell, strikeCount]
  )

  const handleSymbolBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    changeSymbol(e.target.value)
  }

  const handleSymbolKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') changeSymbol((e.target as HTMLInputElement).value)
  }

  // Uncontrolled local value for the symbol input so typing doesn't immediately push to URL
  const [symbolInput, setSymbolInput] = useState(symbol)
  const symbolInputRef = useRef<HTMLInputElement>(null)

  // Sync input when URL symbol changes (back/forward)
  useEffect(() => {
    setSymbolInput(symbol)
  }, [symbol])

  // Native 'change' fires when browser autocomplete selects a value (not on every keystroke).
  // This lets autocomplete selections trigger a full symbol lookup.
  useEffect(() => {
    const el = symbolInputRef.current
    if (!el) return
    const onNativeChange = (e: Event) => {
      const val = (e.target as HTMLInputElement).value
      if (val) changeSymbol(val)
    }
    el.addEventListener('change', onNativeChange)
    return () => el.removeEventListener('change', onNativeChange)
  }, [changeSymbol])

  const handleSymbolChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSymbolInput(e.target.value)
  }

  const handleStrategyChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const s = e.target.value as Strategy
    push({ strategy: s })
    if (symbol) refreshExpirations()
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const t = e.target.value as OptionTypes
    push({ type: t })
    setExpirationDates(data, t)
    refreshExpirations()
  }

  const handleBuySellChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    push({ buySell: e.target.value as BuySell })
  }

  const handleStrikeCountChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const n = Number(e.target.value)
    push({ strikeCount: n })
    // fetch will be triggered by the URL change effect
  }

  const handleDatesChanged: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const dates = Array.from(e.target.selectedOptions, o => o.value)
    setDatesSelected(dates)
  }

  const autoRefreshChanged: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (e.target.checked) {
      timerID.current = window.setInterval(getData, 1000)
    } else {
      if (timerID.current) clearInterval(timerID.current)
    }
  }

  const refreshData: React.MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault()
    getData()
  }

  const comboType: ComboType = strategy === 'single' ? (type as ComboType) : (strategy as ComboType)

  return (
    <div>
      {/* Form bar */}
      <div className="stockform">
        <form onSubmit={e => e.preventDefault()} className="form-inline">

          {showSuccess && (
            <div className="alert alert-success alert-dismissible" role="alert">
              <strong>Thank You!</strong> The {type} was submitted.
              <button type="button" onClick={() => setShowSuccess(false)}>×</button>
            </div>
          )}
          {showFailure !== undefined && (
            <div className="alert alert-danger alert-dismissible" role="alert">
              <strong>Server error.</strong> {showFailure}
              <button type="button" onClick={() => setShowFailure(undefined)}>×</button>
            </div>
          )}

          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              ref={symbolInputRef}
              name="symbol"
              type="text"
              value={symbolInput}
              onBlur={handleSymbolBlur}
              onKeyDown={handleSymbolKeyDown}
              onChange={handleSymbolChange}
              className="form-control"
              placeholder="Enter symbol"
              required
            />
          </div>

          <div className="form-group">
            <label>Option Strategy</label>
            <select name="strategy" className="form-control" onChange={handleStrategyChange} value={strategy}>
              <option value="single">Single</option>
              <option value="straddle">Straddle</option>
            </select>
          </div>

          {/* PUT / CALL toggle */}
          <div className="form-group">
            <div className={`btn-group-vertical toggle-switch-group${strategy !== 'single' ? ' disabled' : ''}`} role="group">
              <label className={`btn toggle-switch-btn${type === 'PUT' ? ' active' : ''}`}>
                <input type="radio" value="PUT" checked={type === 'PUT'} disabled={strategy !== 'single'} onChange={handleTypeChange} />
                Put
              </label>
              <label className={`btn toggle-switch-btn${type === 'CALL' ? ' active' : ''}`}>
                <input type="radio" value="CALL" checked={type === 'CALL'} disabled={strategy !== 'single'} onChange={handleTypeChange} />
                Call
              </label>
            </div>
          </div>

          {/* BUY / SELL toggle */}
          <div className="form-group">
            <div className={`btn-group-vertical toggle-switch-group${strategy !== 'single' ? ' disabled' : ''}`} role="group">
              <label className={`btn toggle-switch-btn${buySell === 'BUY' ? ' active' : ''}`}>
                <input type="radio" name="buySell" value="BUY" checked={buySell === 'BUY'} disabled={strategy !== 'single'} onChange={handleBuySellChange} />
                Buy
              </label>
              <label className={`btn toggle-switch-btn${buySell === 'SELL' ? ' active' : ''}`}>
                <input type="radio" name="buySell" value="SELL" checked={buySell === 'SELL'} disabled={strategy !== 'single'} onChange={handleBuySellChange} />
                Sell
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Strikes</label>
            <select name="strikeCount" className="form-control" onChange={handleStrikeCountChange} value={strikeCount}>
              <option value={0}>All</option>
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          <div className="form-group">
            <label>Choose option dates (Ctrl + Click)</label>
            <select
              name="dates"
              multiple
              className="form-control"
              style={{ width: '12ch', minWidth: '12ch', paddingLeft: '2px', paddingRight: '2px' }}
              onChange={handleDatesChanged}
              value={datesSelected}
            >
              {dateOptions}
            </select>
          </div>

          <fieldset>
            <legend>Price Data</legend>
            <button type="button" className="btn btn-secondary" onClick={refreshData}>Refresh</button>
            <div className="form-check">
              <input type="checkbox" id="AutoRefresh" className="form-check-input" onChange={autoRefreshChanged} />
              <label htmlFor="AutoRefresh" className="form-check-label">Auto Refresh</label>
            </div>
          </fieldset>
        </form>
      </div>

      {/* Results */}
      <div>
        <StockInfo data={data} />
        {data?.status === 'SUCCESS' && (
          <OptionExpirations
            data={data}
            dates={datesSelected}
            type={comboType}
            amBuying={buySell === 'BUY'}
          />
        )}
      </div>
    </div>
  )
}
