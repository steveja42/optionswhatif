import React from 'react';
import Button from "react-bootstrap/Button";
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import {post} from './network'

let sitekey = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY

declare global {
	interface Window {
		grecaptcha:any;
	}
}
type GenericElement = HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement

export class FeedbackForm extends React.Component {
	state = {
		type: 'bug report',
		name: '',
		email: '',
		feedback: '',
		showSuccess: false,
		showFailure: false,
	};


	componentDidMount() {
		setTimeout(() => {
			window.grecaptcha.render('recaptcha', {
				sitekey: sitekey
			});
		}, 300);
	}

	handleChange: React.ChangeEventHandler<GenericElement  > = (event) => {  //: React.FormEvent<HTMLInputElement>
		const target = event.target;
		const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
		this.setState({ [target.name]: value });
		this.setState({ showSuccess: false })
	}

	handleSubmit = async (event: React.SyntheticEvent) => {
		const grecaptchaResponse = window.grecaptcha.getResponse()
		console.log(`"handling form" ${grecaptchaResponse.length} `)
		event.preventDefault();
		if (grecaptchaResponse.length === 0) {
			alert(`reCAPTCHA must be completed`)
			return
		}
		let data = {
			source: 'optionsWhatIf',
			type: this.state.type,
			name: this.state.name,
			email: this.state.email,
			feedback: this.state.feedback,
			grecaptchaResponse,
		}
		let [responseOk,error] = await post(data)
		if (responseOk)
		{
			this.setState({ showFailure: false })
			this.setState({ showSuccess: true })
		}
		else
		{
			this.setState({ showFailure: error.toString() })
			this.setState({ showSuccess: false })
		}

		//alert(`${this.state.type} feedback was submitted: ${this.state.name} ${this.state.email} ${this.state.feedback}`);
//Sorry, server error. Please notify dev@resultify.live
	}
	//onSubmit={this.handleSubmit}  action="http://localhost:8080/feedback" method="post"   action="http://localhost:8081/process_post" method="post"
	render() {
		return (
			<Form onSubmit={this.handleSubmit}  >

				<Alert show={this.state.showSuccess} variant="success" onClose={() => this.setState({ showSuccess: false })} dismissible>
					<Alert.Heading>Thank You! The {this.state.type} was submitted.</Alert.Heading>
				</Alert>
				<Alert show={this.state.showFailure} variant="danger" onClose={() => this.setState({ showFailure: false })} dismissible>
					<Alert.Heading>{this.state.showFailure}</Alert.Heading>
				</Alert>
				<input type="hidden" name="source" value="optionsWhatIf" />
				<div className="form-group" >
					<label >
						Type of feedback
				<select name="type" value={this.state.type} onChange ={this.handleChange  } className="form-control  custom-select">
							<option value="bug report">Bug report</option>
							<option value="feature request">Feature request</option>
							<option value="testimonial">Testimonial</option>
						</select>
					</label> </div>

				<div className="form-group">
					<label>
						Name
				<input name="name" type="name" value={this.state.name} onChange={this.handleChange} className="form-control" placeholder="Enter name" required />
					</label> </div>

				<div className="form-group">
					<label htmlFor="exampleInputEmail1">Email address
		<input name="email" value={this.state.email} onChange={this.handleChange} type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" required />
					</label>
					<small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
				</div>

				<div className="form-group">
					<label>
						Feedback:
				<textarea name="feedback" value={this.state.feedback} onChange={this.handleChange} className="form-control" rows={3} placeholder="Enter feedback" required />
					</label>
				</div>
				<div id="recaptcha" className=" form-group" data-sitekey={sitekey}></div>

				<Button type="submit" value="Submit"> Submit</Button>
				<p />
			</Form>

		);
	}
}
//g-recaptcha
export function Donate() {
	return (
		<div>
			<p>Your contribution will help support development<br></br> and maintenance of OptionsWhatIf.</p>
			<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
				<input type="hidden" name="cmd" value="_donations" />
				<input type="hidden" name="business" value="W8CNL6D983WVS" />
				<input type="hidden" name="currency_code" value="USD" />
				<div className="form-group" >
					<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"  name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
				</div>
				<img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
			</form>
		</div>
	)
}