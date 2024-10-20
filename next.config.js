/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove the experimental.appDir option as it's no longer needed in Next.js 14
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
    })
    return config
  },
}

module.exports = nextConfig
