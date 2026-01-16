# CDN 配置指南

## 概述

配置 CDN（内容分发网络）来加速静态资源和图片的加载，提升全球用户的访问速度。

## Cloudflare Pages CDN（已配置）

如果使用 Cloudflare Pages 部署，静态资源已经通过 Cloudflare 的全球 CDN 自动加速。

### 当前配置

- **静态资源**: 自动通过 Cloudflare CDN
- **图片**: 通过 Cloudflare CDN
- **API**: 通过 Cloudflare Workers（边缘计算）

## 进一步优化

### 1. 图片 CDN 优化

#### 选项 A: 使用 Cloudflare Images（推荐）

Cloudflare Images 提供：
- 自动图片优化和格式转换
- 全球 CDN 加速
- 响应式图片生成

**配置步骤**:

1. 在 Cloudflare Dashboard 启用 Images
2. 获取 API Token
3. 上传图片时使用 Cloudflare Images API

**代码示例**:

```typescript
// src/core/images/cloudflareImages.ts
export async function uploadToCloudflareImages(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.result.variants[0]; // Returns optimized CDN URL
}
```

#### 选项 B: 使用 Cloudflare R2 + CDN

1. 创建 R2 Bucket
2. 配置自定义域名
3. 通过 Cloudflare CDN 加速

### 2. 静态资源 CDN 配置

#### Next.js 静态资源优化

在 `next.config.ts` 中配置：

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  
  // 如果使用自定义 CDN
  assetPrefix: process.env.CDN_URL || '',
  
  // 或者使用环境变量
  images: {
    // ... existing config
    // 如果图片存储在 CDN
    domains: [
      'cdn.yourdomain.com',
      'images.cloudflare.com',
    ],
  },
};
```

#### 环境变量配置

```env
# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
NEXT_PUBLIC_IMAGES_CDN_URL=https://images.yourdomain.com
```

### 3. API CDN 缓存策略

#### Cloudflare Workers 缓存配置

在 `wrangler.toml` 或 Worker 代码中配置缓存：

```typescript
// Cloudflare Worker 缓存示例
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Cache static assets for 1 year
    if (url.pathname.startsWith('/_next/static/')) {
      return caches.default.match(request).then(response => {
        if (response) return response;
        
        return fetch(request).then(response => {
          const newResponse = response.clone();
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          caches.default.put(request, newResponse);
          return response;
        });
      });
    }
    
    // Cache API responses for 5 minutes
    if (url.pathname.startsWith('/api/')) {
      const cacheKey = new Request(url.toString(), request);
      const cached = await caches.default.match(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await fetch(request);
      const newResponse = response.clone();
      newResponse.headers.set('Cache-Control', 'public, max-age=300');
      await caches.default.put(cacheKey, newResponse);
      return response;
    }
    
    return fetch(request);
  },
};
```

### 4. 前端资源预加载

在 `src/app/layout.tsx` 中添加：

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        {/* Preconnect to CDN */}
        <link rel="preconnect" href="https://cdn.yourdomain.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.yourdomain.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/geist-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/logo.png" as="image" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### 5. 图片优化配置

#### Next.js Image 组件 CDN 配置

如果使用自定义图片 CDN：

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.yourdomain.com',
      },
      {
        protocol: 'https',
        hostname: 'images.cloudflare.com',
      },
    ],
    // 如果使用 Cloudflare Images
    loader: 'custom',
    loaderFile: './src/core/images/cloudflareLoader.ts',
  },
};
```

创建自定义 loader:

```typescript
// src/core/images/cloudflareLoader.ts
export default function cloudflareLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Cloudflare Images variant URL
  return `https://imagedelivery.net/{account_hash}/${src}/public?w=${width}&q=${quality || 75}`;
}
```

## 性能监控

### 使用 Web Vitals 监控 CDN 性能

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Cloudflare Analytics

在 Cloudflare Dashboard 查看：
- 带宽使用
- 请求数量
- 缓存命中率
- 全球访问速度

## 检查清单

### Cloudflare Pages（当前）

- [x] 静态资源自动通过 CDN
- [x] 图片通过 CDN
- [ ] 配置 Cloudflare Images（可选）
- [ ] 配置 API 缓存策略（可选）

### 自定义 CDN（如果需要）

- [ ] 设置 CDN 域名
- [ ] 配置 DNS CNAME
- [ ] 上传静态资源到 CDN
- [ ] 配置 Next.js assetPrefix
- [ ] 测试 CDN 访问速度
- [ ] 监控 CDN 使用情况

## 性能提升预期

- **静态资源加载**: 提升 50-70%（全球用户）
- **图片加载**: 提升 60-80%（CDN + 优化）
- **首屏加载时间**: 减少 30-40%（预加载 + CDN）

## 注意事项

1. **缓存失效**: 确保 CDN 缓存策略正确
2. **HTTPS**: 确保所有 CDN 资源使用 HTTPS
3. **CORS**: 配置正确的 CORS 策略
4. **成本**: 监控 CDN 带宽使用和成本
