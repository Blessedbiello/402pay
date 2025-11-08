/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@402pay/sdk', '@402pay/shared'],
};

module.exports = nextConfig;
