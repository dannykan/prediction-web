import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Cloudflare Pages 不支持 Next.js 内置图片优化
    // 必须设置为 true 以避免 Worker 异常
    unoptimized: true,
  },
};

export default nextConfig;
