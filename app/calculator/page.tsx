import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { OptionsWhatIf } from '@/components/OptionsWhatIf'

export const metadata: Metadata = {
  title: 'OptionsWhatIf | Instant Online Options Payoff Matrix & ROI Modeler',
  description: 'Instantly calculate potential profit and ROI for options trading. A zero-formula web modeler with 6-point price scenarios, auto-refresh quotes, and intrinsic value analysis.',
  keywords: ['options payoff matrix', 'options profit calculator', 'options ROI model', 'stock option analysis tool'],
  alternates: { canonical: '/calculator' },
}

export default function CalculatorPage() {
  return (
    <>
      <h1 className="visually-hidden">OptionsWhatIf — Options Payoff Matrix &amp; ROI Modeler</h1>
      <Suspense>
        <OptionsWhatIf />
      </Suspense>
      <p className="calculator-help-link">
        New here? <Link href="/#how-it-works">See how it works</Link>
      </p>
    </>
  )
}
