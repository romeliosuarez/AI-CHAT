/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://chat-ai-portfolio.vercel.app',
  },
}

module.exports = nextConfig