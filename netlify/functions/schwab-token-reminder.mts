import { checkTokensAndNotify } from '../../lib/token-reminder'

// Netlify scheduled function: runs hourly on published deploys only (not on deploy previews
// or in `netlify dev`). Test locally with: netlify functions:invoke schwab-token-reminder
export default async function handler(): Promise<Response> {
  try {
    const summary = await checkTokensAndNotify()
    console.log(`schwab-token-reminder: ${summary}`)
    return new Response(summary)
  } catch (err) {
    console.error('schwab-token-reminder failed:', err)
    return new Response('error', { status: 500 })
  }
}

export const config = {
  schedule: '@hourly',
}
