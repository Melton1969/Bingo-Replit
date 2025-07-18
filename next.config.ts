import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only add allowedDevOrigins if REPLIT_DOMAINS exists (for Replit development)
  ...(process.env.REPLIT_DOMAINS && {
    allowedDevOrigins: [process.env.REPLIT_DOMAINS.split(",")[0]],
  }),
};

export default nextConfig;
