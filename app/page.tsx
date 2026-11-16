import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ComparisonTable } from '@/components/ComparisonTable'
import { SectionNav, type NavSection } from '@/components/SectionNav'

export const metadata: Metadata = {
  title: 'OptionsWhatIf | Free Options Profit Calculator & Payoff Matrix',
  description:
    'See the potential profit and ROI of stock options before you trade. A free online payoff matrix for Puts, Calls, and Straddles with live quotes and editable price scenarios.',
  keywords: ['options profit calculator', 'options payoff matrix', 'options ROI calculator', 'straddle calculator'],
  alternates: { canonical: '/' },
}

const SECTIONS: NavSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'compare', label: 'Web vs. Sheets' },
  { id: 'faq', label: 'FAQ' },
]

const ICON_PROPS = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const FEATURES = [
  {
    title: '6-point ROI model',
    text: 'See profit and ROI at price changes of 10%, 33%, 50%, 66%, 90%, and 100%. Click any price point to enter your own target.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
  {
    title: 'Live quotes',
    text: 'Pull the latest prices with Refresh, or turn on Auto-Refresh to update every second while the market is open.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    ),
  },
  {
    title: 'Puts, Calls & Straddles',
    text: 'Model buying or selling a single Put or Call, or a Straddle, across as many expiration dates and strikes as you like.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
        <circle cx="9" cy="7" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="7" cy="17" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Conservative pricing',
    text: 'The bid/ask mid-point is used as the option price, and profit is based on intrinsic value at expiry: no rosy assumptions.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Zero formulas',
    text: 'Type a ticker and pick your dates. The payoff matrix builds itself, with no spreadsheet setup and nothing to install.',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Free, no sign-up',
    text: 'No account, no paywall. Open the calculator and start modeling straight away.',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    title: 'Enter a ticker',
    text: 'Type any US stock symbol and press Enter.',
  },
  {
    title: 'Choose your trade',
    text: 'Pick Single or Straddle, Put or Call, Buy or Sell, and how many strikes to show. Then Ctrl + Click one or more expiration dates.',
  },
  {
    title: 'Read the matrix',
    text: 'Each expiration gets a payoff table showing potential profit and ROI for every strike across seven price-change scenarios.',
  },
  {
    title: 'Tune your thesis',
    text: 'Click any price point to enter a custom target, hit Refresh for new quotes, or turn on Auto-Refresh for a live view.',
  },
]

const FAQ = [
  {
    q: 'Is OptionsWhatIf free?',
    a: 'Yes. The web calculator is free to use and needs no account or sign-up.',
  },
  {
    q: 'Where does the price data come from?',
    a: 'Quotes are fetched on our server from a real-time market data provider and sent to your browser. Nothing you enter is stored.',
  },
  {
    q: 'What does "profit based on intrinsic value" mean?',
    a: "Profit is calculated from what each option would be worth at expiration if the stock reached the target price (its intrinsic value), minus the premium. It leaves out any remaining time value, so it's a conservative, at-expiry view of the payoff.",
  },
  {
    q: 'Why is the bid/ask mid-point used as the option price?',
    a: 'The mid-point between the bid and the ask is a fair estimate of where an order is likely to fill. Your actual fill may be better or worse, especially for options with wide spreads.',
  },
  {
    q: 'What is a straddle?',
    a: 'A straddle combines a Put and a Call with the same strike and expiration. It pays off when the stock makes a big move in either direction, which makes it useful for modeling trades around earnings or other events.',
  },
  {
    q: 'Can I save my analysis?',
    a: 'The web app resets when you reload the page, but its URL keeps your symbol and settings, so you can bookmark or share it. To keep a full analysis, use the Google Sheets Add-on, which saves each options chain as a permanent tab in your spreadsheet.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function Home() {
  return (
    <div className="landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SectionNav sections={SECTIONS} />

      {/* Overview / hero */}
      <section id="overview" className="landing-section landing-hero">
        <div className="container">
          <p className="landing-eyebrow">Options profit calculator</p>
          <h1 className="landing-hero-title">
            Know your payoff <span className="landing-accent">before</span> you trade.
          </h1>
          <p className="landing-hero-lead">
            OptionsWhatIf turns a live options chain into a payoff matrix. See the potential
            profit and ROI for every strike and expiration as the stock moves.
          </p>
          <div className="landing-hero-actions">
            <Link href="/calculator" className="btn btn-primary btn-lg landing-btn">
              Open Calculator
            </Link>
            <Link href="/calculator?symbol=AAPL" className="btn btn-outline-primary btn-lg landing-btn">
              Try an example
            </Link>
            <Link href="/aboutaddon" className="btn btn-link btn-lg landing-btn-link">
              Get the Sheets Add-on →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Features</h2>
          <p className="landing-section-lead">Everything you need to size up an options trade in seconds.</p>
          <div className="row g-4">
            {FEATURES.map(f => (
              <div key={f.title} className="col-sm-6 col-lg-4">
                <div className="feature-card h-100">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-text">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-section-alt">
        <div className="container">
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-lead">From ticker to payoff matrix in four steps.</p>
          <ol className="steps row g-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="col-sm-6 col-lg-3">
                <div className="step h-100">
                  <span className="step-number" aria-hidden="true">{i + 1}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Image
            src="/options-payoff-matrix-web-app.png"
            alt="Screenshot of OptionsWhatIf web app showing the options payoff matrix"
            className="landing-screenshot"
            width={1200}
            height={900}
            sizes="(min-width: 1200px) 1100px, 100vw"
          />
        </div>
      </section>

      {/* Web app vs. Sheets add-on */}
      <section id="compare" className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Web App vs. Google Sheets Add-on</h2>
          <p className="landing-section-lead">
            Need to save your analysis or work across multiple sessions? The{' '}
            <Link href="/aboutaddon">OptionsWhatIf Google Sheets Add-on</Link> creates a permanent tab in
            your spreadsheet with a one-click price update button.
          </p>
          <ComparisonTable />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section landing-section-alt">
        <div className="container landing-narrow">
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <div className="cta-band">
        <div className="container">
          <h2 className="cta-title">Ready to model your next trade?</h2>
          <Link href="/calculator" className="btn btn-light btn-lg landing-btn">
            Open Calculator
          </Link>
        </div>
      </div>
    </div>
  )
}
