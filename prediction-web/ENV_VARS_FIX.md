# 环境变量修复指南

## 问题

Google 登录失败，错误信息：
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set`
- `/api/me` 返回 401（未授权）
- `/api/markets` 返回 500（服务器错误）

## 原因

Cloudflare Pages 的环境变量没有正确配置。

## 解决方案

### 方法 1：通过 Cloudflare Dashboard 设置（推荐）

1. **访问 Cloudflare Pages 项目设置**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings

2. **找到 "Environment variables" 部分**

3. **添加以下环境变量：**

   **Production 环境：**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`

   **Preview 环境（同样设置）：**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`

4. **保存设置**

5. **重新部署**
   - 环境变量在构建时被嵌入，需要重新部署才能生效
   - 使用 `./deploy.sh` 或通过 Dashboard 手动触发部署

### 方法 2：通过 API 设置（已自动执行）

我已经通过 Cloudflare API 设置了这些环境变量。请验证：

1. **检查环境变量是否已设置**
   ```bash
   # 查看当前配置
   curl -X GET "https://api.cloudflare.com/client/v4/accounts/3f788981872971344ab14a8fcafa5c8f/pages/projects/predictiongod" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
   ```

2. **如果已设置，重新部署**
   ```bash
   cd prediction-web
   ./deploy.sh
   ```

## 验证步骤

1. **等待部署完成**（约 2-3 分钟）

2. **访问网站**
   - https://predictiongod.app
   - https://predictiongod.pages.dev

3. **检查控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 应该不再有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 错误

4. **测试 Google 登录**
   - 点击登录按钮
   - 应该能正常弹出 Google 登录窗口

5. **检查 API 请求**
   - 查看 Network 标签
   - `/api/me` 应该返回 401（未登录时正常）
   - `/api/markets` 应该返回 200（如果后端正常）

## 环境变量说明

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-production-8f6c.up.railway.app` | 后端 API 基础 URL |
| `NEXT_PUBLIC_SITE_URL` | `https://predictiongod.app` | 网站 URL（用于 SEO 和 OAuth 回调） |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com` | Google OAuth Client ID |

## 注意事项

1. **环境变量在构建时嵌入**
   - Next.js 的 `NEXT_PUBLIC_*` 变量在构建时被嵌入到客户端代码中
   - 修改环境变量后必须重新部署才能生效

2. **Production vs Preview**
   - Production 环境变量用于生产部署
   - Preview 环境变量用于预览部署
   - 建议两者设置相同的值

3. **安全性**
   - `NEXT_PUBLIC_*` 变量会暴露在客户端代码中
   - 这些变量是公开的，可以安全使用
   - 不要将敏感信息（如 API keys、secrets）放在 `NEXT_PUBLIC_*` 变量中

## 如果问题仍然存在

1. **清除浏览器缓存**
   - 按 `Cmd+Shift+R`（Mac）或 `Ctrl+Shift+R`（Windows）强制刷新

2. **检查部署日志**
   - 在 Cloudflare Dashboard 中查看部署日志
   - 确认构建过程中没有错误

3. **验证环境变量**
   - 在部署日志中搜索环境变量名称
   - 确认它们被正确读取

4. **重新部署**
   - 使用 `./deploy.sh` 重新部署
   - 确保使用最新的代码和环境变量
