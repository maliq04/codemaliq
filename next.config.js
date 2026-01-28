/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'media.dev.to'
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ],
    // Allow data URLs for inline SVG placeholders
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  // Disable font optimization to prevent build hanging on network issues
  optimizeFonts: false,
  env: {
    CODEMALIQ_SERVICE: process.env.CODEMALIQ_SERVICE || '',
  }
}

module.exports = nextConfig
