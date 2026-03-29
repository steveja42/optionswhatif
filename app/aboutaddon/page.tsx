import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ComparisonTable } from '@/components/ComparisonTable'

export const metadata: Metadata = {
  title: 'OptionsWhatIf | Google Sheets Options Add-on & Strategy Generator',
  description:
    'Generate permanent options payoff sheets in Google Sheets. Install the OptionsWhatIf add-on for persistent strategy tracking with one-click price updates.',
  openGraph: {
    images: [{ url: '/api/og?page=addon', width: 1200, height: 630, alt: 'OptionsWhatIf Sheets Add-on' }],
  },
  twitter: {
    images: ['/api/og?page=addon'],
  },
}

export default function AboutSheetsAddon() {
  return (
    <div className="container py-5">
      <h1 className="h3 mb-1">OptionsWhatIf Google Sheets Add-on</h1>
      <p className="text-muted mb-4">
        Professional-grade options analysis — saved permanently in your Google account.
      </p>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card h-100 border-0 bg-body-secondary p-4">
            <h2 className="h5 mb-2">Permanent Strategy Generator</h2>
            <p className="mb-0">
              Unlike the web app — which resets on every page load — the add-on inserts a{' '}
              <strong>new tab directly into your Google Sheet</strong> for each options chain
              you generate. Your analysis stays right where you left it, across sessions and
              devices.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 bg-body-secondary p-4">
            <h2 className="h5 mb-2">&ldquo;Update Prices&rdquo; Button</h2>
            <p className="mb-0">
              Refresh market data for any saved sheet with a single click of the{' '}
              <strong>Update Prices</strong> button in the sidebar. No page reload, no lost
              customizations — your layout and notes stay intact while prices update in place.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 bg-body-secondary p-4">
            <h2 className="h5 mb-2">Data Privacy</h2>
            <p className="mb-0">
              The add-on builds your options sheet <strong>locally inside Google Sheets</strong>.
              No trading data, positions, or portfolio information is transmitted to any external
              server. Your analysis stays in your Google account — period.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 bg-body-secondary p-4">
            <h2 className="h5 mb-2">Full Sheets Customization</h2>
            <p className="mb-0">
              Once generated, the sheet is plain spreadsheet data. Add your own formulas,
              conditional formatting, notes, or charts. The 6-point price model (10%, 33%, 50%,
              66%, 90%, 100%) gives you a solid starting point, and every cell is yours to extend.
            </p>
          </div>
        </div>
      </div>

      <h2 className="h5 mb-3">Getting Started</h2>
      <ol className="mb-5">
        <li className="mb-2">
          Install the add-on from the{' '}
          <a
            href="https://gsuite.google.com/marketplace/app/optionswhatif/381044359711?pann=cwsdp&hl=en"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Workspace Marketplace
          </a>
          .
        </li>
        <li className="mb-2">
          Open any Google Sheet, then go to <strong>Extensions &gt; OptionsWhatIf &gt; Start</strong>.
        </li>
        <li className="mb-2">
          Enter a US stock symbol and choose the expiration dates you want to analyze.
        </li>
        <li className="mb-2">
          A new sheet tab is inserted with the full payoff matrix. Use the{' '}
          <strong>Update Prices</strong> button in the sidebar to refresh quotes at any time.
        </li>
      </ol>

      <Image
        src="/sheetsaddonscreenshot.png"
        alt="Screenshot of the OptionsWhatIf Google Sheets add-on showing an options payoff matrix tab"
        className="graphic mb-5 rounded border"
        width={1200}
        height={900}
        style={{ width: '100%', height: 'auto' }}
      />

      <h2 className="h5 mb-3">Add-on vs. Web App</h2>
      <p className="text-muted mb-4">
        Want a quick, no-install snapshot instead?{' '}
        <Link href="/">The web app</Link> runs in your browser with Auto-Refresh and zero setup.
      </p>
      <ComparisonTable />
    </div>
  )
}
