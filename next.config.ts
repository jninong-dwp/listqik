import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Next picking a parent folder (e.g. C:\Users\Nin) when multiple lockfiles exist.
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
