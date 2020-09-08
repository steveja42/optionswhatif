
import React from 'react';
import Button from "react-bootstrap/Button";
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Container from "react-bootstrap/Container"
import * as td from './td'
import {OptionExpirations,StockInfo} from './owicomponents'

const log = console.log


//see https://developer.tdameritrade.com/option-chains/apis/get/marketdata/chains for more info
export class OptionsWhatIf extends React.Component {
	state = {
		type: 'PUT',
		buySell: 'BUY',
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
		let dateOptions = null
		if (!data)
			return
		const optionMap = data.putExpDateMap //(type === "PUT") ? data.putExpDateMap : data.callExpDateMap;
		if (optionMap)
			dateOptions = Object.keys(optionMap).map((date) => <option key={date} value={date}>{date.slice(0, 10)}</option>)
		
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
			 if (this.areNoWrongExpirationDates(result)) {
				this.setState({ data: result })
				this.setState({ showFailure: false })
			}
			else
				this.setState({ showFailure: "got back invalid option date, please try again" })

			return result

		}

		else {
			this.setState({ showFailure: error.toString() })
			return null
		}
	}
	//sometimes TD sends us wrong expiration dates, so check for that
	areNoWrongExpirationDates(data) {
		if ((data.status == 'SUCCESS') && this.state.datesSelected) {
			const optionMap = data.putExpDateMap // (this.state.type === "PUT") ? dataToCheck.putExpDateMap : dataToCheck.callExpDateMap;
			for (let date of this.state.datesSelected) {
				if (!optionMap[date]) {
					log(`data error: expiration ${date} not in ${JSON.stringify(optionMap).slice(0, 12)}...`)
					return false
				}

			}
		}
		return true
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
						<Form.Group as="fieldset" controlId="buySell" disabled={this.state.strategy !== 'single'}>
							<legend>.</legend>
							<Form.Check type='radio' name="buySell" id='BUY' value='BUY' label='Buy' checked={(this.state.buySell === 'BUY')} onChange={this.handleChange} />
							<Form.Check type='radio' name="buySell" id='SELL' value='SELL' label='Sell' checked={(this.state.buySell === 'SELL')} onChange={this.handleChange} />
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
								<option value={30}>30</option>
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
					{!this.dataError && this.state.data && this.state.data.status == 'SUCCESS' &&
						<OptionExpirations data={this.state.data} dates={this.state.datesSelected} type={this.state.strategy === 'single' ? this.state.type : this.state.strategy} amBuying={this.state.buySell==="BUY"} />
					}

				</Container>
			</div>
		);
	}
}
