import type { Metadata } from 'next'
import { FeedbackForm, Donate } from '@/components/FeedbackForm'

export const metadata: Metadata = {
  title: 'Give Feedback - OptionsWhatIf',
}

export default function FeedbackPage() {
  return (
    <div className="container">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="col feedbackform">
          <FeedbackForm />
        </div>
        <div className="col-auto rounded donatebox">
          <Donate />
        </div>
      </div>
    </div>
  )
}
