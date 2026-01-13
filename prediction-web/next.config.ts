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
  // 優化 bundle 大小
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },
  // Next.js 16 默認使用 SWC minify，無需明確設置
  // compress 不是有效的 Next.js 配置選項
};

export default nextConfig;
