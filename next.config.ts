import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://109.172.100.166:8000'}/api/:path*`,
      },
      {
        // Проксируем WebSocket/HTTP на путь /projects к бэкенду для Socket.IO
        source: '/projects',
        destination: `${process.env.NEXT_PUBLIC_WS_URL || 'http://109.172.100.166:8000'}/projects`,
      },
    ];
  },
};

export default nextConfig;
