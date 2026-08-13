import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep `next build` from replacing a running dev server's route cache.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
