import { NextRequest, NextResponse } from 'next/server'
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";   //https://developers.mailersend.com/api/v1/email.html
import type { FeedbackPayload } from '@/lib/types'

const ALLOWED_TYPES = ['bug report', 'feature request', 'testimonial', 'other']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SOURCE_RE = /^[A-Za-z0-9_.-]{1,40}$/

/** Verify a reCAPTCHA v2 token with Google. */
async function verifyRecaptcha(token: string, remoteIp: string | null): Promise<boolean> {
  const secret = process.env.GOOGLE_RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('[feedback] GOOGLE_RECAPTCHA_SECRET_KEY is not set — rejecting submission')
    return false
  }
  if (!token) return false

  const params = new URLSearchParams({ secret, response: token })
  if (remoteIp) params.set('remoteip', remoteIp)

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }
    if (!data.success) console.warn('[feedback] reCAPTCHA failed:', data['error-codes'])
    return data.success === true
  } catch (err) {
    console.error('[feedback] reCAPTCHA verify request failed:', err)
    return false
  }
}

/** Returns an error message if the payload is invalid, otherwise null. */
function validate(body: Partial<FeedbackPayload>): string | null {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : ''

  if (!ALLOWED_TYPES.includes(String(body.type))) return 'Invalid feedback type'
  if (!name || name.length > 100) return 'Please enter your name'
  if (!EMAIL_RE.test(email) || email.length > 200) return 'Please enter a valid email address'
  if (feedback.length < 5 || feedback.length > 5000) return 'Please enter a message (at least 5 characters)'
  if (!/\p{L}/u.test(feedback)) return 'Please describe your feedback in words'
  return null
}

export async function POST(request: NextRequest) {
  let body: FeedbackPayload & { website?: string }
  try {
    body = await request.json() as FeedbackPayload & { website?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: real users never see or fill the "website" field.
  // Pretend success so bots don't retry.
  if (body.website) {
    console.warn('[feedback] honeypot triggered, dropping submission')
    return NextResponse.json({ ok: true })
  }

  const validationError = validate(body)
  if (validationError) {
    console.warn('[feedback] rejected:', validationError)
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const remoteIp = request.headers.get('x-nf-client-connection-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? null
  if (!(await verifyRecaptcha(body.grecaptchaResponse ?? '', remoteIp))) {
    return NextResponse.json({ error: 'reCAPTCHA verification failed. Please try again.' }, { status: 400 })
  }

  // Determine source from ?source= query param (e.g. "sheets"). It goes into the email
  // subject, so only accept a short plain label.
  const url = new URL(request.url)
  const sourceParam = url.searchParams.get('source') ?? ''
  body.source = SOURCE_RE.test(sourceParam) ? sourceParam : 'OptionsWhatIf-Nextjs'

  const clean: FeedbackPayload = {
    source: body.source,
    type: body.type,
    name: body.name.trim(),
    email: body.email.trim(),
    feedback: body.feedback.trim(),
    grecaptchaResponse: '',
  }

  // Log server-side (visible in Netlify function logs)
  console.log('[feedback]', JSON.stringify(clean))
  const subject = `${clean.source} ${clean.type} from ${clean.name}`
  const text = `${clean.type} regarding ${clean.source} from ${clean.name} - ${clean.email}\n${clean.feedback}\n\n` + JSON.stringify(clean)

  try {
    await sendMail(subject, text, clean.email)
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
		.setReplyTo(replyTo ? new Sender(replyTo) : sentFrom)
		.setSubject(subject)
		.setText(text);

	const result = await mailerSend.email.send(emailParams);

	console.log( `Message sent: ${result}`);
}
