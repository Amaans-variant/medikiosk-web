/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@medikiosk/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
