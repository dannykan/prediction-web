# Worker Error 1101 修复指南

## 问题

部署后出现 Error 1101: "Worker threw exception"

```
Error 1101 Ray ID: 9bcaa3ffeb25a9c7 • 2026-01-12 06:36:37 UTC
Worker threw exception
```

## 可能的原因

1. **导入的模块不存在** - `_worker.js` 中导入的模块路径可能不正确
2. **运行时错误** - Worker 执行时遇到未捕获的异常
3. **环境变量缺失** - 某些必需的环境变量未设置
4. **模块路径问题** - 相对路径导入可能无法解析

## 诊断步骤

### 1. 检查正常工作的部署

`c04ebc5d` 部署正常工作，让我们对比一下：

```bash
# 检查正常部署
curl -I https://c04ebc5d.predictiongod.pages.dev/
# 应该返回 307 重定向

# 检查失败的部署
curl -I https://61395b1d.predictiongod.pages.dev/
# 返回 500 错误
```

### 2. 检查构建输出

确保所有必需的模块都存在：

```bash
cd prediction-web

# 检查关键文件
test -f .open-next/_worker.js && echo "✅ _worker.js exists"
test -f .open-next/cloudflare/images.js && echo "✅ images.js exists"
test -f .open-next/middleware/handler.mjs && echo "✅ handler.mjs exists"
test -d .open-next/server-functions/default && echo "✅ server-functions exists"
```

### 3. 检查环境变量

确保在 Cloudflare Dashboard 中设置了所有必需的环境变量：

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 解决方案

### 方案 1：使用正常工作的部署（最快）

将 `c04ebc5d` 提升为 Production：

1. 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

2. 找到 `c04ebc5d` 部署

3. 点击 `...` 菜单，选择 **"Promote to production"**

### 方案 2：重新构建并部署

如果 `c04ebc5d` 的代码不是最新的，需要重新构建：

```bash
cd prediction-web

# 清理旧的构建
rm -rf .open-next

# 重新构建
npm run build:cloudflare

# 验证构建输出
test -f .open-next/_worker.js && echo "✅ _worker.js exists" || echo "❌ _worker.js missing"
test -f .open-next/cloudflare/images.js && echo "✅ images.js exists" || echo "❌ images.js missing"
test -f .open-next/middleware/handler.mjs && echo "✅ handler.mjs exists" || echo "❌ handler.mjs missing"

# 如果所有文件都存在，部署
wrangler pages deploy .open-next --project-name=predictiongod
```

### 方案 3：检查 OpenNext 版本

如果问题持续，可能是 OpenNext 版本问题：

```bash
# 检查当前版本
npm list @opennextjs/cloudflare

# 如果需要，更新到最新版本
npm install @opennextjs/cloudflare@latest
```

## 临时解决方案

**立即使用正常工作的部署：**

```bash
# 将 c04ebc5d 提升为 Production
# 通过 Cloudflare Dashboard 操作
```

## 验证修复

1. **等待部署完成**（约 2-3 分钟）

2. **访问网站**
   - https://predictiongod.app
   - https://predictiongod.pages.dev

3. **检查是否正常**
   - 应该能正常加载页面
   - 不再出现 Error 1101

## 如果问题仍然存在

1. **查看 Cloudflare Worker 日志**
   - 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments/61395b1d
   - 查看 "Logs" 标签
   - 查找具体的错误信息

2. **检查构建日志**
   - 在部署详情中查看构建日志
   - 确认是否有警告或错误

3. **对比正常部署**
   - 比较 `c04ebc5d` 和 `61395b1d` 的构建输出
   - 检查文件差异

## 建议

**当前最佳方案：**
1. ✅ 使用 `c04ebc5d` 作为 Production（已验证正常工作）
2. ✅ 确保环境变量已正确设置
3. ✅ 如果代码有更新，重新构建并部署
