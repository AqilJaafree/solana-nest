/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable Turbopack
    turbo: false,
  },
  // Let Next.js handle CSS automatically
  cssFileHandler: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
