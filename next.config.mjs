/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage — thumbnail, avatar
        protocol: 'https',
        hostname:  'okngiusslhilqpjkvuaj.supabase.co',
        pathname:  '/storage/v1/object/public/**',
      },
      {
        // Mux thumbnail
        protocol: 'https',
        hostname:  'image.mux.com',
      },
      {
        // Google OAuth avatar
        protocol: 'https',
        hostname:  'lh3.googleusercontent.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
