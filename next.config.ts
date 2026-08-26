import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Seed data is read from the filesystem at render time.
  typedRoutes: true,
};

export default nextConfig;
