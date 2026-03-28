import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { Navbar } from '@/components/Navbar'
import { Analytics } from '@/components/Analytics'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.optionswhatif.com'),
  title: 'Options Profit Calculator & ROI Visualizer | OptionsWhatIf',
  description:
    'Analyze stock option ROI and profit with our interactive payoff matrix and strategic modeler. A free tool for traders to model Puts, Calls, and Straddles before they trade.',
  openGraph: {
    title: 'Options Profit Calculator & ROI Visualizer | OptionsWhatIf',
    description:
      'Analyze stock option ROI and profit with our interactive payoff matrix and strategic modeler. A free tool for traders to model Puts, Calls, and Straddles before they trade.',
    url: 'https://www.optionswhatif.com',
    siteName: 'OptionsWhatIf',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'OptionsWhatIf - Options Profit Calculator',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Options Profit Calculator & ROI Visualizer | OptionsWhatIf',
    description:
      'Analyze stock option ROI and profit with our interactive payoff matrix and strategic modeler. A free tool for traders to model Puts, Calls, and Straddles before they trade.',
    images: ['/api/og'],
  },
}

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'OptionsWhatIf',
  'applicationCategory': 'FinanceApplication',
  'applicationSubCategory': 'Options Trading Tool',
  'operatingSystem': 'Web',
  'url': 'https://www.optionswhatif.com',
  'description': 'An interactive stock option profit calculator and ROI visualizer. Model Puts, Calls, and Straddles with real-time data integration to visualize trading outcomes.',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD',
  },
  'featureList': [
    'Real-time Options Profit Visualization',
    'Strategy Modeling for Straddles, Puts, and Calls',
    'ROI Probability Calculator',
    'Google Sheets Integration',
    'Interactive 7-point ROI model',
    'One-click Google Sheets programmatic generation',
    'Live bid/ask mid-point price integration'
  ],
  'author': {
    '@type': 'Organization',
    'name': 'OptionsWhatIf'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `window.goatcounter={endpoint:'/api/c'}` }} />
        <script async src="/api/s" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <div className="App">
          <Navbar />
          <main>{children}</main>
        </div>
        <Suspense>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
