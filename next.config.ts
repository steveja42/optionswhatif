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
}

export default nextConfig
