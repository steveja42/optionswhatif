import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { OptionsWhatIf } from '@/components/OptionsWhatIf'
import { ComparisonTable } from '@/components/ComparisonTable'
import { CollapsibleSection } from '@/components/CollapsibleSection'

export const metadata: Metadata = {
  title: 'OptionsWhatIf | Instant Online Options Payoff Matrix & ROI Modeler',
  description: 'Instantly calculate potential profit and ROI for options trading. A zero-formula web modeler with 7-point price scenarios, auto-refresh quotes, and intrinsic value analysis.',
  keywords: ['options payoff matrix', 'options profit calculator', 'options ROI model', 'stock option analysis tool'],
}
export default function Home() {
  return (
    <>
      <h1 className="visually-hidden">OptionsWhatIf — Options Payoff Matrix &amp; ROI Modeler</h1>
      <OptionsWhatIf />

      <hr style={{ borderTop: 'none', borderBottom: '2px solid black', background: 'black', color: 'black', margin: 0 }} />
      <div style={{ background: '#f0f4f8', minHeight: '100vh' }}>
        <div className="container pt-3 pb-5">
        <div className="text-center mb-3">
          <Link href="/aboutaddon" className="btn btn-outline-primary">Want to save this model? Get the Google Sheets Add-on</Link>
        </div>

        <CollapsibleSection title="How It Works">
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h3 className="h6 text-uppercase text-muted mb-2">Getting started</h3>
              <p>
                Enter a US stock ticker symbol, then select one or more option expiration dates.
                The tool instantly generates a strategic payoff matrix, providing a clear visualization of potential outcomes showing potential profit and ROI across
                seven price-change scenarios.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="h6 text-uppercase text-muted mb-2">The 7-point ROI model</h3>
              <p>
                Results are shown at price changes of <strong>0%, 10%, 33%, 50%, 66%, 90%, and 100%</strong>.
                Each price point is editable — click any value to enter a custom price and see
                tailored outcomes for your specific trade thesis.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="h6 text-uppercase text-muted mb-2">Refresh vs. Auto-Refresh</h3>
              <p>
                Hit <strong>Refresh</strong> to pull the latest quotes on demand. Enable{' '}
                <strong>Auto-Refresh</strong> to update prices every second — useful when markets
                are open and you want a live view without touching the keyboard.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="h6 text-uppercase text-muted mb-2">Pricing &amp; profit methodology</h3>
              <p>
                The <strong>mid-point of the Bid/Ask spread</strong> is used as the option price.
                Profit is calculated from <strong>intrinsic value</strong>, giving a conservative,
                at-expiry view of each contract&rsquo;s payoff.
              </p>
            </div>
          </div>

          <Image
            src="/options-payoff-matrix-web-app.png"
            alt="Screenshot of OptionsWhatIf web app showing the options payoff matrix"
            className="graphic mb-5 rounded border"
            width={1200}
            height={900}
            style={{ width: '100%', height: 'auto' }}
          />
        </CollapsibleSection>

        <div className="mt-4">
          <CollapsibleSection title="Web App vs. Google Sheets Add-on">
            <p className="text-muted mb-4">
              Need to save your analysis or work across multiple sessions?{' '}
              <Link href="/aboutaddon">OptionsWhatIf Google Sheets Add-on</Link> creates a permanent tab in your
              spreadsheet with a one-click price update button.
            </p>
            <ComparisonTable />
          </CollapsibleSection>
        </div>
      </div>
      </div>
    </>
  )
}
