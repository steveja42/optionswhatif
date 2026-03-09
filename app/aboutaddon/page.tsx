import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sheets Add-On - OptionsWhatIf',
}

export default function AboutSheetsAddon() {
  return (
    <div className="container">
      <h3>OptionsWhatIf Google Sheets Add-On</h3>
      <p>A stock option tool for investors and speculators that shows possible outcomes for the stock options you select.</p>
      <p>It can help guide your investment decisions by creating data sheets that show potential stock option profit and ROI at various price points.</p>
      <p>
        OptionsWhatIf is available as a Google Sheets add-on and can be obtained{' '}
        <a href="https://gsuite.google.com/marketplace/app/optionswhatif/381044359711?pann=cwsdp&hl=en" rel="noopener noreferrer" target="_blank">
          here
        </a>
        .
      </p>
      <p>
        After installing the add-on in Sheets, select the Sheets menu option Add-ons &gt; OptionsWhatIf &gt; Start.
      </p>
      <p>
        Enter a stock symbol (US markets) and choose the desired option expiration dates and a new sheet will be inserted showing price data and potential
        profit and ROI at six different price points — price changes of 10%, 33%, 50%, 66%, 90%, and 100%.
        Price data on a sheet can be updated by selecting the &ldquo;Update prices&rdquo; button on the sidebar.
        The mid point of the bid/ask is used as the option price. Profit is based on intrinsic value.
      </p>
      <Image src="/sheetsaddonscreenshot.png" alt="screenshot of Google Sheet" className="graphic" width={1200} height={900} style={{ width: '100%', height: 'auto' }} />
    </div>
  )
}
