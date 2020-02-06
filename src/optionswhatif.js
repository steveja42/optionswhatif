
import React, { useState } from 'react';
import Button from "react-bootstrap/Button";
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Container from "react-bootstrap/Container"
import Table from 'react-bootstrap/Table'
import * as td from './td'

const log = console.log

//see https://developer.tdameritrade.com/option-chains/apis/get/marketdata/chains for more info
export class OptionsWhatIf extends React.Component {
	state = {
		type: 'PUT',
		symbol: '',
		strategy: 'single',
		dateOptions: null,
		datesSelected: [],
		data: null,
		optionMap: null,
		showSuccess: false,
		showFailure: false,
		strikeCount: 5,
	};
	fetching = false
	dataError = false
	componentDidMount() {

	}
	componentWillUnmount() {
		if (this.timerID)
			clearInterval(this.timerID);
	}

	async changeSymbol() {
		let result
		if (this.state.symbol)
			result = await this.getData(this.state.symbol)
		if (result)
			this.setExpirationDates(result)
		this.refreshExpirations()
	}

	symbolChanged = async (event) => {
		this.changeSymbol()
	}
	handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			console.log('enter press here! ')
			this.changeSymbol()
		}
	}

	/**
	 * event: user changed option type- PUT/CALL
	 *
	 * @param event
	 */
	optionTypeChanged = (event) => {
		const target = event.target
		this.setState({ type: target.value })
		this.setExpirationDates(this.state.data, target.value)
		this.refreshExpirations()
	}
	/**
	 * event: user toggled autorefresh
	 *
	 * @param event
	 */
	autoRefreshChanged = (event) => {
		if (event.target.checked) {
			this.timerID = setInterval(this.getData, 1000)
		}
		else {
			if (this.timerID)
				clearInterval(this.timerID);
		}
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [target.name]: value });
		if (target.name === 'strikeCount' && this.state.symbol)
			this.getData(this.state.symbol, value)
		if (target.name === 'strategy' && this.state.symbol)
			this.refreshExpirations()

		//	this.setExpirationDates(this.state.data, value)
	}

	datesChanged = (event) => {
		const datesSelected = Array.from(event.target.selectedOptions, option => option.value);
		log(event.target.value)
		this.setState({ datesSelected });
	}

	refreshExpirations() {
		const datesSelected = this.state.datesSelected
		if (datesSelected.length > 0) {
			this.setState({ datesSelected: [] })
			this.setState({ datesSelected });
		}
	}


	handleSubmit = async (event) => {

		event.preventDefault();
	}
	refreshData = async (event) => {

		event.preventDefault()
		this.getData()
	}
	/**
	 *  sets the expiration dates that are displayed
	 *
	 * @param event
	 */

	setExpirationDates(data, type = this.state.type) {
		if (!data)
			return
		const optionMap = data.putExpDateMap //(type === "PUT") ? data.putExpDateMap : data.callExpDateMap;
		const dateOptions = Object.keys(optionMap).map((date) => <option key={date} value={date}>{date.slice(0, 10)}</option>)
		this.setState({ dateOptions })
	}

	getData = async (symbol = this.state.symbol, strikeCount = this.state.strikeCount) => {
		if (!symbol || this.fetching)
			return
		this.fetching = true
		//let route = `optchain?symbol=${symbol.toUpperCase()}`
		let [result, error] = await td.getOptionChain(symbol.toUpperCase(), undefined, strikeCount) //get(route)
		this.fetching = false
		if (result) {
			if (!this.isDataError(result))
				this.setState({ data: result })
			else
				this.setState({ showFailure: "got back invalid option date, please try again" })

			this.setState({ showFailure: false })
			return result

		}

		else {
			this.setState({ showFailure: error.toString() })
			return null
		}
	}
	//sometimes TD sends us wrong expiration dates, so check for that
	isDataError(dataToCheck) {
		if (this.state.datesSelected) {
			const optionMap = dataToCheck.putExpDateMap // (this.state.type === "PUT") ? dataToCheck.putExpDateMap : dataToCheck.callExpDateMap;
			for (let date of this.state.datesSelected) {
				if (!optionMap[date]) {
					log(`data error: expiration ${date} not in ${JSON.stringify(optionMap).slice(0, 12)}...`)
					return true
				}

			}
		}
		return false
	}

	//alert(`${this.state.type} feedback was submitted: ${this.state.name} ${this.state.email} ${this.state.feedback}`);

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		log(error)
		log(errorInfo)
	}
	//onSubmit={this.handleSubmit}  action="http://localhost:8080/feedback" method="post"   action="http://localhost:8081/process_post" method="post"
	render() {
		return (
			<div>
				<Container fluid className="stockform">
					<Form inline onSubmit={this.handleSubmit}  >

						<Alert show={this.state.showSuccess} variant="success" onClose={() => this.setState({ showSuccess: false })} dismissible>
							<Alert.Heading>Thank You! The {this.state.type} was submitted.</Alert.Heading>
						</Alert>
						<Alert show={this.state.showFailure} variant="danger" onClose={() => this.setState({ showFailure: false })} dismissible>
							<Alert.Heading>Server error. {this.state.showFailure}</Alert.Heading>
						</Alert>

						<Form.Group controlId="symbol" >
							<label> Stock Symbol </label>
							<input name="symbol" type="symbol" value={this.state.symbol} onBlur={this.symbolChanged} onKeyPress={this.handleKeyPress} onChange={this.handleChange} className="form-control" placeholder="Enter symbol" required />
						</Form.Group>
						<Form.Group controlId="strategy" >
							<label>Option Strategy</label>
							<Form.Control as="select" name="strategy" onChange={this.handleChange} value={this.state.strategy}>
								<option value="single">Single</option>
								<option value="straddle">Straddle</option>
							</Form.Control>
						</Form.Group>
						<Form.Group as="fieldset" controlId="type" disabled={this.state.strategy !== 'single'}>
							<legend>Option Type</legend>
							<Form.Check type='radio' id='PUT' value='PUT' label='Put' checked={(this.state.type === 'PUT')} onChange={this.optionTypeChanged} />
							<Form.Check type='radio' id='CALL' value='CALL' label='Call' checked={(this.state.type === 'CALL')} onChange={this.optionTypeChanged} />
						</Form.Group>
						<Form.Group controlId="strikeCount" >
							<label>Strikes</label>
							<Form.Control as="select" name="strikeCount" onChange={this.handleChange} value={this.state.strikeCount}>
								<option value={0}>All</option>
								<option value={1}>1</option>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={15}>15</option>
								<option value={20}>20</option>
							</Form.Control>
						</Form.Group>
						<Form.Group controlId="dates" className="foo">
							<label>Choose option dates (Ctrl + Click)</label>
							<Form.Control as="select" name="dates" multiple onChange={this.datesChanged} value={this.state.datesSelected}>
								{this.state.dateOptions}
							</Form.Control>
						</Form.Group>
						<Form.Group as="fieldset" controlId="pricedata" >
							<legend>Price Data</legend>

							<Button type='button' id='refresh' value="refresh" onClick={this.refreshData}> Refresh</Button>
							<Form.Check type='checkbox' id='AutoRefresh' label='Auto Refresh' onChange={this.autoRefreshChanged} />
						</Form.Group>

					</Form>
				</Container>
				<Container fluid>
					<StockInfo data={this.state.data ? this.state.data : null} />
					{!this.dataError &&
						<OptionExpirations data={this.state.data} dates={this.state.datesSelected} type={this.state.strategy === 'single' ? this.state.type : this.state.strategy} />
					}

				</Container>
			</div>
		);
	}
}
/**
 * React Component- framework to display multiple expiration dates
 *
 */
function OptionExpirations(props) {
	const { data, dates, type } = props
	if (!data || !dates || dates.length === 0) {
		return null
	}
	let expDates = dates.map(date => <OptionExpiration title={date.slice(0, 10)} key={date} data={data} type={type} date={date} />)   //data=optionMap[date]
	return (
		<div>
			{expDates}
		</div>
	)
}
/**
 * React Component- displays title (Expiration Date and  option type), and data table
 *
 * @param event
 */
function OptionExpiration(props) {
	const { title, data, type, date } = props
	const underlyingPrice = Number(data && data.underlying.last)
	let [pricePoints, setPricePoints] = useState(getDefaultPricePoints(underlyingPrice, type))
	let [previousType, setPreviousType] = useState(type)
	if (!data) {
		log("no data")
		return null
	}

	if (previousType !== type) {
		setPreviousType(type)
		setPricePoints(getDefaultPricePoints(underlyingPrice, type))
	}


	const updateElement = event => {
		let ppCopy = [...pricePoints]
		ppCopy[Number(event.target.name)] = event.target.value
		setPricePoints(ppCopy)
	};

	//const type = Object.values(data)[0][0].putCall
	let priceRows = Object.entries(data.putExpDateMap[date]).map(([strike, value]) => <OptionRow key={strike} strike={strike} data={data} type={type} date={date} put={value[0]} pricePoints={pricePoints} call={data.callExpDateMap[date][strike][0]} />)   //data={value[0]}
	// [strike, Utilities.formatDate(new Date(value[0].quoteTimeInLong), "GMT-8", "MMM-dd' 'HH:mm:ss"), value[0].last, value[0].markChange, value[0].bid, value[0].ask, value[0].totalVolume, value[0].openInterest]);
	return (
		<div>
			<h3>{`${title} ${type}'s`}</h3>

			<Table id="stocktable" className="stocktable" bordered striped hover size="sm">
				<thead><PricePointsHeaderRow underlyingPrice={underlyingPrice} type={type} pricePoints={pricePoints} onPricePointChange={updateElement} /></thead>
				<thead><OptionHeaderRow type={type} /></thead>
				<tbody>
					{priceRows}
				</tbody>
			</Table>
		</div>
	)

}

// <input name={j} type="text" value={pricePoints[j]}  onChange={updateElement} className="pp" placeholder="Enter #" />

/**
 * renders the 2nd header row of a options data table
 * 
 */
function OptionHeaderRow(props) {
	const coreHeaders = ["Strike", "Bid", "Ask", "Last", "Price", "Breakeven"]
	const straddleHeaders = ["Bid", "Ask", "Vol", "Breakeven", "Strike", "Bid", "Ask", "Price", "Bid", "Ask", "Vol", "Breakeven"]
	const profitHeaders = ["Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI", "Profit", "ROI"]

	const { type } = props
	let corePart
	let i = 0
	if (type === "straddle")
		corePart = straddleHeaders.map(headerName => <th key={i++} className={(headerName === 'Strike') ? 'colborder' : (i === 8) ? 'sectionborder' : undefined}>{headerName}</th>)
	else
		corePart = coreHeaders.map(headerName => <th key={i++} className={(headerName === 'Strike') ? 'colborder' : undefined}>{headerName}</th>)
	const profitsPart = profitHeaders.map(x => <th key={x + i++}>{x}</th>)
	return (
		<tr>{corePart}{profitsPart}</tr>
	)
}

/**
 * renders the first header row of a options data table that shows the price points
 * 
 */
function PricePointsHeaderRow(props) {
	const ppStraddleHeaders = ['Puts', '', '', '', '', 'Straddle', '', '', 'Calls', '', '']
	const ppSingleHeaders = ['', '', '', '', '']

	const { underlyingPrice, type, pricePoints, onPricePointChange } = props

	let i = 0
	let corePart
	if (type === "straddle")
		corePart = ppStraddleHeaders.map(x => <th key={i++} className={(i === 8) ? 'sectionborder' : (i === 5) ? 'colborder' : undefined}>{x}</th>)
	else
		corePart = ppSingleHeaders.map(x => <th key={i++} className={(i === 1) ? 'colborder' : undefined}>{x}</th>)

	let ppPart = []
	let priceChangeMessage = 'If Price Goes To'

	//for (; i < numBlankRows; i++) {
	//	ppPart.push(<th key={i}> </th>)
	//}
	ppPart.push(<th key={i++}>{priceChangeMessage}</th>)
	let j = 0
	for (let pricePoint of pricePoints) {
		let priceChange = pricePoint / underlyingPrice - 1


		ppPart.push(<th key={i++}>
			<input name={j} type="text" value={pricePoints[j]} onChange={onPricePointChange} className="pp" placeholder="Enter #" />
		</th>)
		j++
		ppPart.push(<th key={i++}>({priceChange.toLocaleString(undefined, { style: "percent", maximumFractionDigits: 0 })} change)</th>)
	}
	return (
		<tr>
			{corePart}{ppPart}
		</tr>
	)
}


const pricePointPercentages = [.10, .33, .5, .66, .9, 1]

/**
 * returns the profit at a price point
 * 
 */
function getProfit(pricePoint, price, strike, type) {
	let profit
	switch (type) {
		case 'PUT':
			profit = strike - price - pricePoint
			break
		case 'CALL':
			profit = pricePoint - strike + price
			break
		case 'straddle':
			if (pricePoint >= strike)
				profit = pricePoint - strike + price
			else
				profit = strike - price - pricePoint
			break
		//no default
	}
	return profit.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/**
 * returns array of the price points used
 * 
 */
function getDefaultPricePoints(underlyingPrice, type) {
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
			//no default
		}
		return currencyFormat(pricePoint)
	})
}

function currencyFormat(num) {
	return num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

const optionDataFields = ["bid", "ask", "last"]
const legDataFields = ["bid", "ask", "totalVolume"]
/**
 * renders one row of a options data table
 * 
 */
function OptionRow(props) {
	const { strike, data, type, put, call, pricePoints } = props
	if (!data)
		return null
	let leftPart, coreVals = []
	let breakeven, option, price
	let i = 0

	switch (type) {
		case 'straddle':
			leftPart = []
			option = put
			for (let field of legDataFields) {
				leftPart.push(<td key={i++}>{option[field]}</td>)
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
				coreVals.push(<td key={i++}>{option[field]}</td>)
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
				coreVals.push(<td key={i++}>{option[fieldName]}</td>)
			}
			coreVals.push(<td key={i++}>{currencyFormat(price)}</td>)
			coreVals.push(<td key={i++}>{currencyFormat(breakeven)}</td>)

	}
	let profitsPart = []
	i = 0
	for (let pricePoint of pricePoints) {
		let profit = getProfit(pricePoint, price, Number(strike), type)
		let roi = profit / price
		profitsPart.push(<td key={`profit${i}`}> {profit}</td>)
		profitsPart.push(<td key={`roi${i++}`}> {roi.toLocaleString(undefined, { style: "percent", maximumFractionDigits: 2 })}</td>)
	}
	return (
		<tr>
			{leftPart}<td className='colborder'>{strike}</td>{coreVals}{profitsPart}
		</tr>
	)
}
/**
 * renders underlying stock price
 * 
 */
export function StockInfo(props) {
	let stockData = props.data
	if (!stockData)
		return null
	let underlying = stockData.underlying
	return (
		<div>
			<h2>{underlying.symbol} :{underlying.last} <span>  {stockData.isDelayed ? ' (delayed)':'' } </span></h2> <span> {underlying.description}</span>
		</div>
	)
}
