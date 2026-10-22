/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // Kept off to stay within the Vercel image-optimization quota; static
    // images in /public are pre-sized instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Static images in /public rarely change; let browsers and the CDN cache them.
        source: '/:file(.+\\.(?:jpg|jpeg|png|webp|svg|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
