import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Options WhatIf - stock option investing tool',
  description:
    'Stock Option investing tool that shows potential profit for the stock options you select to help you in your trading and investing',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        <script src="https://www.google.com/recaptcha/api.js" async defer />
      </head>
      <body className={inter.className}>
        <div className="App">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
