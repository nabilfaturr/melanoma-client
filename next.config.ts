import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Gunakan environment variable, bukan hardcode
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
