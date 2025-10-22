/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/feeds/:path*',
        destination: '/api/feeds/:path*',
      },
      {
        source: '/audio/:path*',
        destination: '/api/audio/:path*',
      },
    ]
  },
}

module.exports = nextConfig