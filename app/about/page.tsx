import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About - OptionsWhatIf WebApp',
}

export default function AboutWebApp() {
  return (
    <div className="container">
      <h3>OptionsWhatIf WebApp</h3>
      <p>A stock option tool for investors and speculators that shows possible outcomes for the stock options you select.</p>
      <p>It can help guide your investment decisions by showing the potential stock option profit and ROI at various price points.</p>
      <p>
        The OptionsWhatIf Web App can be found <Link href="/">here</Link>.
      </p>
      <p>
        Enter a stock symbol (US markets) and choose the desired option expiration dates and the page will show
        price data and potential profit and ROI at seven different price points — price changes of 0% 10%, 33%, 50%, 66%, 90%, and 100%.
        You can edit the price points to see customized results. Price data can be updated by selecting the &ldquo;Refresh&rdquo; button.
        Checking &ldquo;Auto Refresh&rdquo; will update the prices every second. The mid point of the bid/ask is used as the option price.
        Profit is based on intrinsic value.
      </p>
      <Image src="/webappscreenshot.png" alt="screenshot of Web App" className="graphic" width={1200} height={900} style={{ width: '100%', height: 'auto' }} />
    </div>
  )
}
