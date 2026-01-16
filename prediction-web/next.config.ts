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
    // CDN 配置：如果使用自定义 CDN，可以在这里配置
    // domains: process.env.NEXT_PUBLIC_IMAGES_CDN_DOMAIN 
    //   ? [process.env.NEXT_PUBLIC_IMAGES_CDN_DOMAIN] 
    //   : undefined,
  },
  // 優化 bundle 大小
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },
  // CDN 配置：如果使用自定义 CDN 域名
  // assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',
  // Next.js 16 默認使用 SWC minify 和 gzip/brotli 壓縮
  // 無需額外配置
};

export default nextConfig;
