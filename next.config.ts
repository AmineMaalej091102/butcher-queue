import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow localtunnel/ngrok for development
  allowedDevOrigins: ["*.loca.lt", "*.trycloudflare.com", "sad-zebras-lick.loca.lt", "192.168.1.25"],
};

export default nextConfig;
