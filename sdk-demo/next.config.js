/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GELATO_API_KEY: process.env.GELATO_API_KEY,
  },
}

module.exports = nextConfig
