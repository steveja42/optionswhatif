'use client'

import { Component } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      render: (id: string, opts: { sitekey: string }) => void
      getResponse: () => string
    }
  }
}

type GenericElement = HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement

interface FeedbackState {
  type: string
  name: string
  email: string
  feedback: string
  showSuccess: boolean
  showFailure: string | false
  isLoading: boolean
}

export class FeedbackForm extends Component<Record<string, never>, FeedbackState> {
  state: FeedbackState = {
    type: 'bug report',
    name: '',
    email: '',
    feedback: '',
    showSuccess: false,
    showFailure: false,
    isLoading: false,
  }

  componentDidMount() {
    const sitekey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY
    if (sitekey && window.grecaptcha) {
      setTimeout(() => {
        window.grecaptcha.render('recaptcha', { sitekey })
      }, 300)
    }
  }

  handleChange: React.ChangeEventHandler<GenericElement> = event => {
    const target = event.target
    const value =
      target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    this.setState({ [target.name]: value } as unknown as FeedbackState)
    this.setState({ showSuccess: false })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const grecaptchaResponse = window.grecaptcha?.getResponse() ?? ''
    this.setState({ isLoading: true })

    const data = {
      source: 'optionsWhatIf',
      type: this.state.type,
      name: this.state.name,
      email: this.state.email,
      feedback: this.state.feedback,
      grecaptchaResponse,
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        this.setState({ showFailure: false, showSuccess: true })
      } else {
        const text = await response.text()
        this.setState({ showFailure: `Error: ${response.status} ${text}`, showSuccess: false })
      }
    } catch (err) {
      this.setState({
        showFailure: err instanceof Error ? err.message : String(err),
        showSuccess: false,
      })
    } finally {
      this.setState({ isLoading: false })
    }
  }

  render() {
    const sitekey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY
    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.showSuccess && (
          <div className="alert alert-success alert-dismissible" role="alert">
            <strong>Thank You!</strong> The {this.state.type} was submitted.
            <button type="button" onClick={() => this.setState({ showSuccess: false })}>×</button>
          </div>
        )}
        {this.state.showFailure && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {this.state.showFailure}
            <button type="button" onClick={() => this.setState({ showFailure: false })}>×</button>
          </div>
        )}

        <div className="form-group">
          <label>
            Type of feedback
            <select name="type" value={this.state.type} onChange={this.handleChange} className="form-control custom-select">
              <option value="bug report">Bug report</option>
              <option value="feature request">Feature request</option>
              <option value="testimonial">Testimonial</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label>
            Name
            <input name="name" type="text" value={this.state.name} onChange={this.handleChange} className="form-control" placeholder="Enter name" required />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="emailInput">Email address</label>
          <input name="email" type="email" id="emailInput" value={this.state.email} onChange={this.handleChange} className="form-control" aria-describedby="emailHelp" placeholder="Enter email" required />
          <small id="emailHelp" className="form-text text-muted">{"We'll never share your email with anyone else."}</small>
        </div>

        <div className="form-group">
          <label>
            Feedback:
            <textarea name="feedback" value={this.state.feedback} onChange={this.handleChange} className="form-control" rows={3} placeholder="Enter feedback" required />
          </label>
        </div>

        <div id="recaptcha" className="form-group" data-sitekey={sitekey} />

        <button type="submit" className="btn btn-primary" disabled={this.state.isLoading}>
          Submit{this.state.isLoading && ' …'}
        </button>
      </form>
    )
  }
}

export function Donate() {
  return (
    <div>
      <p>Your contribution will help support development<br />and maintenance of OptionsWhatIf.</p>
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
        <input type="hidden" name="cmd" value="_donations" />
        <input type="hidden" name="business" value="W8CNL6D983WVS" />
        <input type="hidden" name="currency_code" value="USD" />
        <div className="form-group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
      </form>
    </div>
  )
}
