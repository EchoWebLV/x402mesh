/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-phantom',
    '@solana/wallet-adapter-wallets'
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Export as static site
  output: 'export',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
