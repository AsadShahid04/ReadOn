/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wav)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/audio/',
            outputPath: 'static/audio/',
            name: '[name].[ext]',
            esModule: false,
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
