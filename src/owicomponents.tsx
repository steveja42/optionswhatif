import React, { useState } from 'react';
import Table from 'react-bootstrap/Table'
import { log,ll} from './util'

interface OptionPriceInfo {
	putCall: string,
	symbol: string,
	description: string,
	exchangeName: string,
	bid: number,
	ask: number,
	last: number,
	mark: number,
	bidSize: number,
	askSize: number,
	bidAskSize: string,
	lastSize: number,
	highPrice: number,
	lowPrice: number,
	openPrice: number,
	closePrice: number,
	totalVolume: number,
	tradeDate?: string,
	tradeTimeInLong: number,
	quoteTimeInLong: number,
	netChange: number,
	volatility: number,
	delta: number,
	gamma: number,
	theta: number,
	vega: number,
	rho: number,
	openInterest: number,
	timeValue: number,
	theoreticalOptionValue: number,
	theoreticalVolatility: number,
	optionDeliverablesList?: string,
	strikePrice: number,
	expirationDate: number,
	daysToExpiration: number,
	expirationType: string,
	lastTradingDay: number,
	multiplier: number,
	settlementType: string,
	deliverableNote: string,
	isIndexOption?: string,
	percentChange: number,
	markChange: number,
	markPercentChange: number,
	inTheMoney: boolean,
	mini: boolean,
	nonStandard: boolean
}


interface priceMap {
	[price: string]: OptionPriceInfo[]

}
export interface ExpirationDateMap {
	[expDate: string]: priceMap

}

export type OptionChainN = OptionChain | null
export interface OptionChain {
	symbol: string,
	status: string,
	underlying: {
		symbol: string,
		description: string,
		change: number,
		percentChange: number,
		close: number,
		quoteTime: number,
		tradeTime: number,
		bid: number,
		ask: number,
		last: number,
		mark: number,
		markChange: number,
		markPercentChange: number,
		bidSize: number,
		askSize: number,
		highPrice: number,
		lowPrice: number,
		openPrice: number,
		totalVolume: number,
		exchangeName: string,
		fiftyTwoWeekHigh: number,
		fiftyTwoWeekLow: number,
		delayed: boolean
	},
	strategy: string,
	interval: number,
	isDelayed: boolean,
	isIndex: boolean,
	interestRate: number,
	underlyingPrice: number,
	volatility: number,
	daysToExpiration: number,
	numberOfContracts: number,
	putExpDateMap?: ExpirationDateMap,
	callExpDateMap?: ExpirationDateMap
}

export enum OptionTypes {
	Put = "PUT",
	Call = "CALL"
}

export enum BuySell {
	Buy = "BUY",
	Sell = "SELL"
}
export enum Strategy {
	single = 'single',
	straddle = 'straddle'
}

//type ComboType = (typeof BuySell) | Strategy.straddle

export enum ComboType {
	Put = "PUT",
	Call = "CALL",
	straddle = 'straddle'
}

interface OptionExpirationsProps {
	data: OptionChainN,
	dates: string[],
	type: ComboType,
	amBuying: boolean
}

/**
 * React Component- container to display multiple option expiration dates
 *
 */
export function OptionExpirations(props: OptionExpirationsProps) {
	const { data, dates, type, amBuying } = props
	let expDates
	if (!data || (data.putExpDateMap && (!dates || dates.length === 0))) {
		return null
	}
	if (data.putExpDateMap)
		expDates = dates.map(date => <OptionExpiration title={date.slice(0, 10)} key={date} data={data} type={type} date={date} amBuying={amBuying} />)   //data=optionMap[date]

	return (
		<div>
			{expDates}
		</div>
	)
}

interface OptionExpirationProps {
	title: string,
	data: OptionChainN,
	date: string,
	type: ComboType,
	amBuying: boolean
}
/**
 * React Component- displays title (Expiration Date and  option type), and data table
 *
 * @param event
 */
function OptionExpiration(props: OptionExpirationProps) {
	const { title, data, type, date, amBuying } = props
	const underlyingPrice = Number(data && data.underlying.last)
	let [pricePoints, setPricePoints] = useState(getDefaultPricePoints(underlyingPrice, type))
	let [previousType, setPreviousType] = useState(type)
	const preHeaders = (type !== "straddle") ? ['', '', '', '', '', '', 'If Price Goes to'] : ['', '', '', '', '', '', '', '', '', '', '', '', 'If Price Goes to']

	if (!data) {
		log(ll.normal, "no data")
		return null
	}

	if (previousType !== type) {
		setPreviousType(type)
		setPricePoints(getDefaultPricePoints(underlyingPrice, type))
	}

	const updateElement: React.ChangeEventHandler<HTMLInputElement> = event => {
		let ppCopy = [...pricePoints]
		ppCopy[Number(event.target.name)] = event.target.value
		setPricePoints(ppCopy)
	};
	let i = 0;
	let preHeaderRow = preHeaders.map(x => <th key={i++} className='noborder'>{x}</th>)
	let caption = `${title} ${type}'s`
	//const type = Object.values(data)[0][0].putCall
	let priceRows = Object.entries(data?.putExpDateMap?.[date]!).map(([strike, value]) => <OptionRow key={strike} strike={strike} data={data} type={type} amBuying={amBuying} put={value[0]} pricePoints={pricePoints} call={data?.callExpDateMap?.[date][strike][0]!} />)   //data={value[0]}
	// [strike, Utilities.formatDate(new Date(value[0].quoteTimeInLong), "GMT-8", "MMM-dd' 'HH:mm:ss"), value[0].last, value[0].markChange, value[0].bid, value[0].ask, value[0].totalVolume, value[0].openInterest]);
	//<h3>{`${title} ${type}'s`}</h3>
	return (
		<div>

			<h4>{caption}</h4>
			<Table id="stocktable" className="stocktable" striped hover size="sm">
				<thead><tr>{preHeaderRow}</tr></thead>
				<thead><PricePointsHeaderRow underlyingPrice={underlyingPrice} type={type} pricePoints={pricePoints} onPricePointChange={updateElement} /></thead>
				<thead><OptionHeaderRow type={type} /></thead>
				<tbody>
					{priceRows}
				</tbody>
			</Table>
		</div>
	)

}
interface OptionHeaderRowProps {
	type: ComboType,
}
// <input name={j} type="text" value={pricePoints[j]}  onChange={updateElement} className="pp" placeholder="Enter #" />

/**
 * renders the 2nd header row of a options data table
 * 
 */
function OptionHeaderRow(props: OptionHeaderRowProps) {
	const coreHeaders = ["Strike", "Bid", "Ask", "Last", "Price", "Breakeven"]
	const straddleHeaders = ["Bid", "Ask", "Vol", "Breakeven", "Strike", "Bid", "Ask", "Price", "Bid", "Ask", "Vol", "Breakeven"]
	const profitHeaders = ["Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI"]

	const { type } = props
	let corePart
	let i = 0
	if (type === "straddle")
		corePart = straddleHeaders.map(headerName => <th key={i++} className={(headerName === 'Strike') ? 'colborder' : (i === 7) ? 'sectionborder' : undefined}>{headerName}</th>)
	else
		corePart = coreHeaders.map(headerName => <th key={i++} className={(headerName === 'Strike') ? 'colborder' : undefined}>{headerName}</th>)

	const profitsPart = profitHeaders.map(x => <th key={x + i++} className={(x === 'Profit') ? 'leftborder' : undefined} >{x}</th>)
	return (
		<tr>{corePart}{profitsPart}</tr>
	)
}

interface PricePointsHeaderRowProps {
	underlyingPrice: number,
	type: ComboType,
	pricePoints: string[],
	onPricePointChange: React.ChangeEventHandler<HTMLInputElement>
}
/**
 * renders the first header row of a options data table that shows the price points
 * 
 */
function PricePointsHeaderRow(props: PricePointsHeaderRowProps) {
	const ppStraddleHeaders = ['Puts', '', '', '', '', 'Straddle', '', '', 'Calls', '', '', '']
	const ppSingleHeaders = ['', '', '', '', '', '']

	const { underlyingPrice, type, pricePoints, onPricePointChange } = props

	let i = 0
	let corePart
	if (type === "straddle")
		corePart = ppStraddleHeaders.map(x => <th key={i++} className={(i === 7) ? 'sectionborder' : (i === 4) ? 'colborder' : undefined}>{x}</th>)
	else
		corePart = ppSingleHeaders.map(x => <th key={i++} className={(i === 0) ? 'colborder' : undefined}>{x}</th>)

	let ppPart = []
	//let priceChangeMessage = 'If Price Goes To'

	//for (; i < numBlankRows; i++) {
	//	ppPart.push(<th key={i}> </th>)
	//}
	//ppPart.push(<th key={i++}>{priceChangeMessage}</th>)
	let j = 0
	for (let pricePoint of pricePoints) {
		let priceChange = parseLocaleNumber(pricePoint) / underlyingPrice - 1


		ppPart.push(<th key={i++} className='leftborder'>
			<input name={j.toString()} type="text" value={pricePoints[j]} onChange={onPricePointChange} className="pp" placeholder="Enter #" />
		</th>)
		j++
		ppPart.push(<th key={i++}>({priceChange.toLocaleString(undefined, { style: "percent", maximumFractionDigits: 0 })} change)</th>)
	}
	return (
		<tr>{corePart}{ppPart}</tr>
	)
}



/**
 * returns the profit at a price point
 * 
 */
function getProfit(pricePoint: number, price: number, strike: number, type: ComboType, amBuying: boolean) {
	let profit
	switch (type) {
		case 'PUT':
			if (amBuying)
				profit = strike - price - pricePoint
			else
				profit = (pricePoint > strike) ? price : Math.max(price - (strike - pricePoint), 0)
			break
		case 'CALL':
			if (amBuying)
				profit = pricePoint - (strike + price)
			else
				profit = (pricePoint < strike) ? price : Math.max(price - (pricePoint - strike), 0)
			break
		case 'straddle':
			if (pricePoint >= strike)
				profit = pricePoint - (strike + price)
			else
				profit = strike - price - pricePoint
			break
		default:
			throw new TypeError(`unrecognized type ${type}`)
	}
	if (amBuying && (profit < -price))
		profit = -price

	return profit
}
const pricePointPercentages = [0, .10, .33, .5, .66, .9, 1]
//const pricePointPercentages = [.10, .33, .5, .66, .9, 1]

/**
 * returns array of the price points used
 * 
 */
function getDefaultPricePoints(underlyingPrice: number, type: ComboType) {
	return pricePointPercentages.map(percentChange => {
		let pricePoint
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

function currencyFormat(num: number) {
	return num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}
function percentFormat(num: number) {
	return num.toLocaleString(undefined, { style: "percent", maximumFractionDigits: 2 })
}


interface OptionRowProps {
	strike: string,
	data: OptionChainN,
	type: ComboType,
	amBuying: boolean,
	put: OptionPriceInfo,
	call: OptionPriceInfo,
	pricePoints: string[]
}

const optionDataFields = ["bid", "ask", "last"]
const legDataFields = ["bid", "ask", "totalVolume"]
/**
 * renders one row of a options data table
 * 
 */
function OptionRow(props: OptionRowProps) {
	const { strike, data, type, amBuying, put, call, pricePoints } = props
	if (!data)
		return null
	let leftPart, coreVals = []
	let breakeven=0, option, price
	let i = 0

	switch (type) {
		case 'straddle':
			leftPart = []
			option = put
			for (let field  of legDataFields) {
				leftPart.push(<td key={i++}>{option[field as keyof OptionPriceInfo]}</td>)
			}
			let bid = put.bid + call.bid
			let ask = put.ask + call.ask
			price = (ask - bid) / 2 + bid
			breakeven = Number(strike) - price
			leftPart.push(<td key={i++}>{currencyFormat(breakeven)}</td>)

			coreVals.push(<td key={i++}>{currencyFormat(bid)}</td>)
			coreVals.push(<td key={i++}>{currencyFormat(ask)}</td>)
			coreVals.push(<td key={i++} className='sectionborder'>{currencyFormat(price)}</td>)

			option = call
			for (let field of legDataFields) {
				coreVals.push(<td key={i++}>{option[field as keyof OptionPriceInfo]}</td>)
			}

			breakeven = Number(strike) + price
			coreVals.push(<td key={i++}>{currencyFormat(breakeven)}</td>)

			break
		default:
			option = (type === "PUT") ? put : call
			price = (option.ask - option.bid) / 2 + option.bid
			switch (type) {
				case 'PUT':
					breakeven = Number(strike) - price
					break
				case 'CALL':
					breakeven = Number(strike) + price
					break
				// no default
			}
			for (let fieldName of optionDataFields) {
				coreVals.push(<td key={i++}>{option[fieldName as keyof OptionPriceInfo]}</td>)
			}
			coreVals.push(<td key={i++}>{currencyFormat(price)}</td>)
			coreVals.push(<td key={i++}>{currencyFormat(breakeven)}</td>)

	}
	let profitsPart = []
	i = 0
	for (let pricePoint of pricePoints) {
		let profit = getProfit(parseLocaleNumber(pricePoint), price, Number(strike), type, amBuying)
		let roi = profit / price
		profitsPart.push(<td key={`profit${i}`} className='leftborder'> {currencyFormat(profit)}</td>)
		profitsPart.push(<td key={`roi${i++}`}> {percentFormat(roi)}</td>)
	}
	return (
		<tr>
			{leftPart}<td className='colborder'>{strike}</td>{coreVals}{profitsPart}
		</tr>
	)
}

function parseLocaleNumber(str:string) {
	// Detect the user's locale decimal separator:
	var decimalSeparator = (1.1).toLocaleString().substring(1, 2);
	// Detect the user's locale thousand separator:
	var thousandSeparator = (1000).toLocaleString().substring(1, 2);
	// In case there are locales that don't use a thousand separator
	if (thousandSeparator.match(/\d/))
		thousandSeparator = '';

	if (decimalSeparator === '.')
		decimalSeparator = `/.`
	if (thousandSeparator === '.')
		thousandSeparator = `/.`


	str = str
		.replace(new RegExp(thousandSeparator, 'g'), '')
		.replace(new RegExp(decimalSeparator), '.')

	return parseFloat(str);
}
interface StockInfoProps {
	data: OptionChainN
}

/**
 * renders underlying stock price
 * 
 */
export function StockInfo(props:StockInfoProps) {
	let stockData = props.data
	let info
	if (!stockData)
		return null
	if (stockData.status !== 'SUCCESS')
		info = <h2> no option data found</h2>

	else {  //stockData.underlying data is delayed ~15 minutes, the rest of stockData doesn't seem to be-<span>  {stockData.isDelayed ? ' (delayed)':'' } </span>
		let underlying = stockData.underlying
		info = <div><h2 style={{ display: 'inline' }}>{underlying.symbol} :{currencyFormat(stockData.underlyingPrice)} </h2> <span> {' '}{underlying.description}</span></div>
	}
	return (
		<div>
			{info}
		</div>
	)
}
