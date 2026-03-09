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
      <div className="feedback-card">
        <h5 className="feedback-card-title">Send Feedback</h5>

        {this.state.showSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Thank you!</strong> Your {this.state.type} was submitted.
            <button type="button" className="btn-close" onClick={() => this.setState({ showSuccess: false })} aria-label="Close" />
          </div>
        )}
        {this.state.showFailure && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {this.state.showFailure}
            <button type="button" className="btn-close" onClick={() => this.setState({ showFailure: false })} aria-label="Close" />
          </div>
        )}

        <form onSubmit={this.handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Type</label>
            <select name="type" value={this.state.type} onChange={this.handleChange} className="form-select">
              <option value="bug report">Bug report</option>
              <option value="feature request">Feature request</option>
              <option value="testimonial">Testimonial</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Name</label>
            <input name="name" type="text" value={this.state.name} onChange={this.handleChange} className="form-control" placeholder="Your name" required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input name="email" type="email" value={this.state.email} onChange={this.handleChange} className="form-control" placeholder="your@email.com" required />
            <div className="form-text">{"We'll never share your email with anyone else."}</div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Message</label>
            <textarea name="feedback" value={this.state.feedback} onChange={this.handleChange} className="form-control" rows={4} placeholder="Tell us what you think…" required />
          </div>

          <div id="recaptcha" className="mb-3" data-sitekey={sitekey} />

          <button type="submit" className="btn btn-primary w-100" disabled={this.state.isLoading}>
            {this.state.isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Submitting…</>
            ) : 'Submit Feedback'}
          </button>
        </form>
      </div>
    )
  }
}

export function Donate() {
  const lightningAddress = 'stevus@getalby.com'
  const lightningUri = `lightning:${lightningAddress}`

  return (
    <div className="donate-card">
      <h5 className="donate-card-title">Support OptionsWhatIf</h5>
      <p className="donate-card-subtitle">
        Your contribution helps keep development and maintenance going. Thank you!
      </p>

      {/* PayPal */}
      <div className="donate-method">
        <div className="donate-method-label">
          <span className="donate-method-icon">💳</span>
          PayPal
        </div>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="W8CNL6D983WVS" />
          <input type="hidden" name="currency_code" value="USD" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" className="paypal-btn" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </div>

      <div className="donate-divider">or send crypto</div>

      {/* Lightning Network */}
      <div className="donate-method">
        <div className="donate-method-label">
          <span className="donate-method-icon">⚡</span>
          Lightning Network
        </div>
        <a href={lightningUri} className="donate-crypto-btn donate-lightning-btn">
          ⚡ Pay via Lightning
        </a>
        <div className="donate-address">
          <code>{lightningAddress}</code>
          <button
            type="button"
            className="donate-copy-btn"
            onClick={() => navigator.clipboard.writeText(lightningAddress)}
            title="Copy Lightning address"
          >
            Copy
          </button>
        </div>
        <div className="donate-hint">Works with any Lightning wallet (Alby, Phoenix, Wallet of Satoshi, etc.)</div>
      </div>

      {/* Bitcoin on-chain */}
      <div className="donate-method">
        <div className="donate-method-label">
          <span className="donate-method-icon">₿</span>
          Bitcoin (on-chain)
        </div>
        <div className="donate-hint">Send me a message via the feedback form for a BTC address.</div>
      </div>
    </div>
  )
}
