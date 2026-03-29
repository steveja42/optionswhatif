import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { Navbar } from '@/components/Navbar'
import { Analytics } from '@/components/Analytics'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.optionswhatif.com'),
  title: 'Options Profit Calculator | OptionsWhatIf',
  description:
    'Analyze stock option ROI and profit with our interactive payoff matrix and strategic modeler. A free tool for traders to model Puts, Calls, and Straddles before they trade.',
  openGraph: {
    title: 'Options Profit Calculator | OptionsWhatIf',
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
    title: 'Options Profit Calculator | OptionsWhatIf',
    description:
      'Analyze stock option ROI and profit with our interactive payoff matrix and strategic modeler. A free tool for traders to model Puts, Calls, and Straddles before they trade.',
    images: ['/api/og'],
  },
}

const themeInitScript = `try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches,m=t==='dark'||t==='light'?t:(d?'dark':'light');document.documentElement.setAttribute('data-theme',m);document.documentElement.setAttribute('data-bs-theme',m)}catch(e){}`

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
    'Interactive 6-point ROI model',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
