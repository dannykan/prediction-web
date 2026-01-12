# 🚨 快速修复：Error 1101（图片优化问题）

## 问题

新部署 `4db44f54` 出现 Error 1101，原因是启用了 Next.js 图片优化，但 Cloudflare Pages 不支持。

## 根本原因

Cloudflare Pages **不支持** Next.js 的内置图片优化功能（`/next/image` 路由）。当 `unoptimized: false` 时，Next.js 会尝试访问这个路由，导致 Worker 抛出异常。

## ✅ 已修复

1. **设置 `unoptimized: true`**
   - 在 `next.config.ts` 中设置 `unoptimized: true`
   - 这是 Cloudflare Pages 的要求

2. **保留缓存优化**
   - `_headers` 文件仍然有效
   - 静态资源会被浏览器长期缓存
   - 性能优化通过缓存实现

## 下一步

重新部署：

```bash
cd prediction-web
./deploy.sh
```

## 验证

部署完成后：
1. 访问：https://predictiongod.app
2. 应该不再出现 Error 1101
3. Logo 和其他图片应该正常显示
4. 图片会被浏览器缓存（通过 `_headers` 文件）

## 性能说明

虽然不能使用 Next.js 的图片优化，但：
- ✅ 静态资源通过 `_headers` 被长期缓存
- ✅ 浏览器缓存可以显著提升重复访问速度
- ✅ 如果需要图片优化，可以考虑使用 Cloudflare Images 服务（付费）

## 如果问题仍然存在

1. **使用正常工作的部署**
   - `c04ebc5d` 仍然正常工作
   - 可以将其提升为 Production

2. **检查构建输出**
   - 确认 `unoptimized: true` 已生效
   - 确认 `_headers` 文件存在
