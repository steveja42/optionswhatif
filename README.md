# OptionsWhatIf — Next.js

Stock Option Profit Calculator — Next.js 16.1 / App Router / Netlify.

## Local Development

For most development (no Netlify Blobs needed):

```bash
pnpm dev
```

**Important:** Local development that requires Netlify Blobs (token storage for Schwab OAuth) must use the Netlify CLI instead:

```bash
pnpm dev:netlify
```

This starts `netlify dev`, which provides the Netlify Blobs runtime locally. Use this whenever you need the Schwab OAuth flow or quote fetching to work end-to-end.

## Initial Schwab Auth Setup

On first deploy to Netlify:

1. Visit `/api/auth/schwab/login` in your browser.
2. You will be redirected to Schwab's authorization page — log in and approve access.
3. Schwab redirects back to `/api/auth/schwab/callback`, which exchanges the code for tokens and stores them in Netlify Blobs.
4. All subsequent token refreshes are handled automatically by the server — no manual steps needed.

## Environment Variables

Copy `.env.local` and fill in your Schwab credentials:

```
SCHWAB_API_KEY=        # Your Schwab app client ID
SCHWAB_API_SECRET=     # Your Schwab app client secret
SCHWAB_REDIRECT_URI=   # Must match what's registered in your Schwab app
```

`NETLIFY_SITE_ID` and `NETLIFY_TOKEN` are provided automatically by the Netlify runtime — do not add them manually.

## Build & Deploy

Deployed on Netlify. Build configuration is in `netlify.toml`.

```bash
pnpm build   # production build
```
