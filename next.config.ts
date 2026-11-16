import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
      },
      {
        protocol: 'https',
        hostname: 'www.paypal.com',
      },
    ],
  },
  async headers() {
    // Netlify already sends Strict-Transport-Security and X-Content-Type-Options
    return [
      {
        source: '/:path*',
        headers: [
          // Nobody needs to embed this site; blocks clickjacking (e.g. a framed /owiadmin)
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    // The calculator used to live at "/". Keep old shared links like /?symbol=AAPL working.
    return [
      {
        source: '/',
        has: [{ type: 'query', key: 'symbol' }],
        destination: '/calculator',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
