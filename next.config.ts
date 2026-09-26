import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow other devices on your local Wi-Fi to connect to the dev server
  allowedDevOrigins: [
    "192.168.123.201", 
    "localhost:3000"
  ],
};

export default nextConfig;