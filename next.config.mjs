// next.config.mjs
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: { unoptimized: true },

  webpack: (config) => {
    // Алиас '@' указывает на корень проекта
    config.resolve.alias['@'] = path.resolve(process.cwd());
    return config;
  }
};

export default nextConfig;
