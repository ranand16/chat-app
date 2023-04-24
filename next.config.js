/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    topLevelAwait: true,
  },
  images: ["https://lh3.googleusercontent.com"],
};

module.exports = {
  ...nextConfig,
};
