'use client'

import { Component } from 'react'
import { OptionChainN, OptionTypes, BuySell, Strategy, ComboType } from '@/lib/types'
import { StockInfo } from './StockInfo'
import { OptionExpirations } from './OptionExpirations'

interface State {
  type: OptionTypes
  buySell: BuySell
  symbol: string
  strategy: Strategy
  dateOptions: React.ReactNode[] | null
  datesSelected: string[]
  data: OptionChainN
  showSuccess: boolean
  showFailure: string | undefined
  strikeCount: number
}

type GenericElement = HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement

export class OptionsWhatIf extends Component<Record<string, never>, State> {
  state: State = {
    type: 'PUT',
    buySell: 'BUY',
    symbol: '',
    strategy: 'single',
    dateOptions: null,
    datesSelected: [],
    data: null,
    showSuccess: false,
    showFailure: undefined,
    strikeCount: 5,
  }

  fetching = false
  dataError = false
  timerID = 0

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID)
  }

  async changeSymbol() {
    if (!this.state.symbol) return
    const result = await this.getData(this.state.symbol)
    if (result) this.setExpirationDates(result)
    this.refreshExpirations()
  }

  symbolChanged = () => {
    this.changeSymbol()
  }

  handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') this.changeSymbol()
  }

  optionTypeChanged: React.ChangeEventHandler<GenericElement> = event => {
    const type = event.target.value as OptionTypes
    this.setState({ type })
    this.setExpirationDates(this.state.data, type)
    this.refreshExpirations()
  }

  autoRefreshChanged: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (event.target.checked) {
      this.timerID = window.setInterval(this.getData, 1000)
    } else {
      if (this.timerID) clearInterval(this.timerID)
    }
  }

  handleChange: React.ChangeEventHandler<GenericElement> = event => {
    const target = event.target
    const value =
      target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    this.setState({ ...this.state, [target.name]: value })
    if (target.name === 'strikeCount' && this.state.symbol)
      this.getData(this.state.symbol, value as unknown as number)
    if (target.name === 'strategy' && this.state.symbol) this.refreshExpirations()
  }

  datesChanged: React.ChangeEventHandler<HTMLSelectElement> = event => {
    const datesSelected = Array.from(event.target.selectedOptions, option => option.value)
    this.setState({ datesSelected })
  }

  refreshExpirations() {
    const { datesSelected } = this.state
    if (datesSelected.length > 0) {
      this.setState({ datesSelected: [] })
      this.setState({ datesSelected })
    }
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
  }

  refreshData = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    this.getData()
  }

  setExpirationDates(data: OptionChainN, type = this.state.type) {
    if (!data) return
    const optionMap = data.putExpDateMap
    const dateOptions = optionMap
      ? Object.keys(optionMap).map(date => (
          <option key={date} value={date}>
            {date.slice(0, 10)}
          </option>
        ))
      : null
    this.setState({ dateOptions })
  }

  getData = async (
    symbol = this.state.symbol,
    strikeCount = this.state.strikeCount
  ): Promise<OptionChainN> => {
    if (!symbol || this.fetching) return null
    this.fetching = true

    try {
      const params = new URLSearchParams({
        symbols: symbol.toUpperCase(),
        contractType: 'ALL',
        strikeCount: String(strikeCount),
      })
      const response = await fetch(`/api/quotes?${params.toString()}`)

      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        const msg = json?.error ?? `Server error (${response.status})`
        this.setState({ showFailure: msg })
        return null
      }

      const result = await response.json()

      if (this.areNoWrongExpirationDates(result)) {
        this.setState({ data: result, showFailure: undefined })
      } else {
        this.setState({ showFailure: 'got back invalid option date, please try again' })
      }

      return result
    } catch (err) {
      this.setState({ showFailure: err instanceof Error ? err.message : String(err) })
      return null
    } finally {
      this.fetching = false
    }
  }

  areNoWrongExpirationDates(data: OptionChainN) {
    if (data?.status === 'SUCCESS' && this.state.datesSelected) {
      const optionMap = data.putExpDateMap
      for (const date of this.state.datesSelected) {
        if (!optionMap?.[date]) return false
      }
    }
    return true
  }

  render() {
    const { type, buySell, symbol, strategy, datesSelected, data, showSuccess, showFailure, strikeCount } = this.state
    const comboType: ComboType = strategy === 'single' ? (type as ComboType) : (strategy as ComboType)

    return (
      <div>
        {/* Form bar */}
        <div className="stockform">
          <form onSubmit={this.handleSubmit} className="form-inline">

            {showSuccess && (
              <div className="alert alert-success alert-dismissible" role="alert">
                <strong>Thank You!</strong> The {type} was submitted.
                <button type="button" onClick={() => this.setState({ showSuccess: false })}>×</button>
              </div>
            )}
            {showFailure !== undefined && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <strong>Server error.</strong> {showFailure}
                <button type="button" onClick={() => this.setState({ showFailure: undefined })}>×</button>
              </div>
            )}

            <div className="form-group">
              <label>Stock Symbol</label>
              <input
                name="symbol"
                type="text"
                value={symbol}
                onBlur={this.symbolChanged}
                onKeyPress={this.handleKeyPress}
                onChange={this.handleChange}
                className="form-control"
                placeholder="Enter symbol"
                required
              />
            </div>

            <div className="form-group">
              <label>Option Strategy</label>
              <select name="strategy" className="form-control" onChange={this.handleChange} value={strategy}>
                <option value="single">Single</option>
                <option value="straddle">Straddle</option>
              </select>
            </div>

            {/* PUT / CALL toggle */}
            <fieldset className="mytb" disabled={strategy !== 'single'}>
              <label className={`btn btn-light${type === 'PUT' ? ' active' : ''}`}>
                <input type="radio" value="PUT" checked={type === 'PUT'} disabled={strategy !== 'single'} onChange={this.optionTypeChanged} />
                Put
              </label>
              <label className={`btn btn-light${type === 'CALL' ? ' active' : ''}`}>
                <input type="radio" value="CALL" checked={type === 'CALL'} disabled={strategy !== 'single'} onChange={this.optionTypeChanged} />
                Call
              </label>
            </fieldset>

            {/* BUY / SELL toggle */}
            <fieldset className="mytb" disabled={strategy !== 'single'}>
              <label className={`btn btn-light${buySell === 'BUY' ? ' active' : ''}`}>
                <input type="radio" name="buySell" value="BUY" checked={buySell === 'BUY'} disabled={strategy !== 'single'} onChange={this.handleChange} />
                Buy
              </label>
              <label className={`btn btn-light${buySell === 'SELL' ? ' active' : ''}`}>
                <input type="radio" name="buySell" value="SELL" checked={buySell === 'SELL'} disabled={strategy !== 'single'} onChange={this.handleChange} />
                Sell
              </label>
            </fieldset>

            <div className="form-group">
              <label>Strikes</label>
              <select name="strikeCount" className="form-control" onChange={this.handleChange} value={strikeCount}>
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
              <select name="dates" multiple className="form-control" style={{ width: '12ch', minWidth: '12ch' }} onChange={this.datesChanged} value={datesSelected}>
                {this.state.dateOptions}
              </select>
            </div>

            <fieldset>
              <legend>Price Data</legend>
              <button type="button" className="btn btn-secondary" onClick={this.refreshData}>Refresh</button>
              <div className="form-check">
                <input type="checkbox" id="AutoRefresh" className="form-check-input" onChange={this.autoRefreshChanged} />
                <label htmlFor="AutoRefresh" className="form-check-label">Auto Refresh</label>
              </div>
            </fieldset>
          </form>
        </div>

        {/* Results */}
        <div>
          <StockInfo data={data} />
          {!this.dataError && data?.status === 'SUCCESS' && (
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
}
