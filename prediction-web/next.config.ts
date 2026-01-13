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
  // 啟用 SWC minify（默認已啟用，但明確設置）
  swcMinify: true,
  // 壓縮輸出
  compress: true,
};

export default nextConfig;
