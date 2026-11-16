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
