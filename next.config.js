/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    topLevelAwait: true,
  },
  images: { domains: ["lh3.googleusercontent.com"] },
};

module.exports = {
  ...nextConfig,
};
