import { NextRequest, NextResponse } from 'next/server'
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";   //https://developers.mailersend.com/api/v1/email.html
import type { FeedbackPayload } from '@/lib/types'

// Basic feedback endpoint — logs server-side.
// Replace with your preferred email/storage backend.
export async function POST(request: NextRequest) {
  let body: FeedbackPayload
  try {
    body = await request.json() as FeedbackPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Determine source from ?source= query param, falling back to Referer header
  const url = new URL(request.url)
  const sourceParam = url.searchParams.get('source')
  const referer = request.headers.get('referer') ?? ''
  if (sourceParam) {
    body.source = sourceParam
  } else {
    body.source = 'OptionsWhatIf-Nextjs' 
  }
  console.log(`referer: ${referer}, source param: ${sourceParam}, determined source: ${body.source}`)
  body.grecaptchaResponse = ''
  // Log server-side (visible in Netlify function logs)
  console.log('[feedback]', JSON.stringify(body))
  const subject = `${body.source} ${body.type} from ${body.name}`
  const text = `${body.type} regarding ${body.source} from ${body.name} - ${body.email}\n${body.feedback}\n\n` + JSON.stringify(body)
 
  try {
    await sendMail(subject, text, body.email)
  } catch (err) {
    console.error('[feedback] sendMail failed:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}


export async function sendMail(subject = 'subject  ✔', text = 'email text', replyTo = '') {


	const mailerSend = new MailerSend({
		apiKey: process.env.MailerSend_API_KEY ?? '',
	});

	const sentFrom = new Sender(process.env.email_sender ?? '', "OptionsWhatIf Feedback");

	const recipients = [
		new Recipient(process.env.email_receiver ?? '', "OptionsWhatIf")
	];

	const emailParams = new EmailParams()
		.setFrom(sentFrom)
		.setTo(recipients)
		.setReplyTo(sentFrom)
		.setSubject(subject)
		.setText(text);

	const result = await mailerSend.email.send(emailParams);

	console.log( `Message sent: ${result}`);
}



