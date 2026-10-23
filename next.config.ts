import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // dev only: lets the phone load the dev server through the Cloudflare tunnel
  allowedDevOrigins: ['*.trycloudflare.com'],
};

export default nextConfig;
