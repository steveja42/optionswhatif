## Package manager
Use pnpm for all installs and scripts.

## Language
TypeScript throughout — no .js files.

## Framework
Next.js 16.1 App Router. No Pages Router patterns (no getServerSideProps, getStaticProps, getInitialProps).

## Deployment
Netlify. Build config is in netlify.toml. Plugin: @netlify/plugin-nextjs.

## Dev commands
- `pnpm dev` — standard Next.js dev server (no Netlify Blobs)
- `pnpm dev:netlify` — use this when testing anything that touches Schwab auth or token storage (requires Netlify CLI)
- `pnpm build` — production build, run this to verify before pushing

## Project structure
- `app/` — Next.js App Router pages and API route handlers
- `components/` — React components (all 'use client' where needed)
- `lib/calculations.ts` — ALL financial calculation logic. Never modify formulas.
- `lib/schwab-tokens.ts` — Schwab OAuth token management via Netlify Blobs
- `lib/types.ts` — shared TypeScript interfaces for option chain data

## Critical rules
- NEVER expose SCHWAB_API_KEY, SCHWAB_API_SECRET, or any token to the client.
- NEVER add NEXT_PUBLIC_ prefix to any Schwab credential.
- NEVER call api.schwabapi.com directly from any component or client code. All Schwab traffic must go through app/api/quotes/route.ts.
- NEVER modify any formula or business logic in lib/calculations.ts.
- Tokens are stored in Netlify Blobs (store: "auth", key: "schwab-tokens"). Never use localStorage for tokens.

## Schwab OAuth flow
- Initial setup: visit /api/auth/schwab/login → Schwab login → callback → tokens stored in Blobs
- Subsequent requests: getValidAccessToken() in lib/schwab-tokens.ts handles refresh automatically
- Registered redirect URIs (Schwab developer portal):
  - https://www.optionswhatif.com/api/auth/schwab/callback
  - https://127.0.0.1:8080/api/auth/schwab/callback

## Environment variables
Server-side only (never NEXT_PUBLIC_):
- SCHWAB_API_KEY
- SCHWAB_API_SECRET
- SCHWAB_REDIRECT_URI

Public (safe to expose):
- NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY

Provided automatically by Netlify runtime (do not add manually):
- NETLIFY_SITE_ID
- NETLIFY_TOKEN

## Styling
Bootstrap 5 via CDN (loaded in app/layout.tsx). Custom overrides in app/globals.css. Tailwind is available but Bootstrap is the primary CSS framework here.

## Git / GitHub
The GitHub repo is the same one previously used for the old CRA version of optionswhatif. Force-push replaced the old code. The Netlify site is connected to this repo and auto-deploys on push to master, to domain https://www.optionswhatif.com .
