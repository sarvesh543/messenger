/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true, allowMiddlewareResponseBody: true },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
