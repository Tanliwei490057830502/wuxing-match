import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Dev only: let phones on the same Wi-Fi open the dev server to test the QR code
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "26.*.*.*"],

  // 基本安全头：不给 iframe 套、不让浏览器猜类型、不泄露来源路径
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
