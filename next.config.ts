import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // photo data URLs (base64) reach the companion send action; allow room for them
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
