import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://109.172.100.166:8000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
