import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? (process.env.BACKEND_URL || "http://localhost:8000") + "/api/:path*"
            : "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
