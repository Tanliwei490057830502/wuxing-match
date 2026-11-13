import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Dev only: let phones on the same Wi-Fi open the dev server to test the QR code
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "26.*.*.*"],
};

export default nextConfig;
