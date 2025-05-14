import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ottawacitizen.remembering.ca',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sharif.edu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'currentobitwebstorage.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.navonarecords.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
