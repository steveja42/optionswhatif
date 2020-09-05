
import React from 'react';
import Button from "react-bootstrap/Button";
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Container from "react-bootstrap/Container"
import Table from 'react-bootstrap/Table'
import  * as td from './td'
import {StockInfo} from './owicomponents'

const log = console.log

export class OptionPrices extends React.Component {
	state = {
		type: 'PUT',
		symbol: '',
		dateOptions: null,
		datesSelected: [],
		data: null,
		optionMap: null,
		showSuccess: false,
		showFailure: false,
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
		//if (target.name === 'type' && this.state.data)
		//	this.setExpirationDates(this.state.data, value)
	}

	datesChanged = (event) => {
		const datesSelected = Array.from(event.target.selectedOptions, option => option.value);
		log(event.target.value)
		this.setState({ datesSelected });
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
		const optionMap = (type === "PUT") ? data.putExpDateMap : data.callExpDateMap;
		const dateOptions = Object.keys(optionMap).map((date) => <option key={date} value={date}>{date.slice(0, 10)}</option>)
		this.setState({ dateOptions })
	}

	getData = async (symbol = this.state.symbol) => {
		if (!symbol || this.fetching)
			return
		this.fetching = true
		//let route = `optchain?symbol=${symbol.toUpperCase()}`
		let [result, error] = await td.getOptionChain(symbol.toUpperCase()) //get(route)
		this.fetching = false
		if (result) {
			if (!this.isDataError(result))
				this.setState({ data: result })

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
			const optionMap = (this.state.type === "PUT") ? dataToCheck.putExpDateMap : dataToCheck.callExpDateMap;
			for (let date of this.state.datesSelected) {
				if (!optionMap[date]) {
					log(`data error: expiration ${date} not in ${JSON.stringify(optionMap).slice(0,12)}...`)
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
				
						<Form.Group as="fieldset" controlId="type" >
							<legend>Option Type</legend>
							<Form.Check type='radio' id='PUT' value='PUT' label='Put' checked={(this.state.type === 'PUT')} onChange={this.optionTypeChanged} />
							<Form.Check type='radio' id='CALL' value='CALL' label='Call' checked={(this.state.type === 'CALL')} onChange={this.optionTypeChanged} />
						</Form.Group>

						<Form.Group controlId="dates" className="foo">
							<label>Choose option dates (ctrl + click)</label>
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
					<OptionExpirations data={this.state.data} dates={this.state.datesSelected} type={this.state.type} />
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
	const {data, dates, type} = props
	if (!data || !dates || dates.length === 0) {
		return null
	}
	const optionMap = (type === "PUT") ? data.putExpDateMap : data.callExpDateMap;
	let expDates = dates.map(date => <OptionExpiration title={date.slice(0, 10)} key={date} data={optionMap[date]} />)
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
	const {title, data} = props
	if (!data) {
		log("no data")
		return null
	}

	const type = Object.values(data)[0][0].putCall
	let priceRows = Object.entries(data).map(([strike, value]) => <OptionRow strike={strike} data={value[0]} key={strike} />)
	// [strike, Utilities.formatDate(new Date(value[0].quoteTimeInLong), "GMT-8", "MMM-dd' 'HH:mm:ss"), value[0].last, value[0].markChange, value[0].bid, value[0].ask, value[0].totalVolume, value[0].openInterest]);
	return (
		<div>
			<h3>{`${title} ${type}'s`}</h3>
			<Table className="stocktable" striped bordered hover size="sm">
				<thead><OptionHeaderRow /></thead>
				<tbody>
					{priceRows}
				</tbody>
			</Table>
		</div>
	)

}
const optionHeaders = ["strike", "last", "Market Change", "bid", "ask", "totalVolume", "openInterest"]
/**
 * renders header row of a options data table
 * 
 */
function OptionHeaderRow(props) {

	const row = optionHeaders.map(x => <th key={x}>{x}</th>)
	return (
		<tr>
			{row}
		</tr>
	)
}
const optionDataFields = ["last", "markChange", "bid", "ask", "totalVolume", "openInterest"]
/**
 * renders one row of a options data table
 * 
 */
function OptionRow(props) {
	const {data, strike} = props
	if (!data)
		return null
	const row = optionDataFields.map(fieldName => <td key={fieldName}>{data[fieldName]}</td>)
	return (
		<tr>
			<td>{strike}</td>{row}
		</tr>
	)
}

