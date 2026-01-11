# 🔧 修复前端本地开发环境配置

## 问题

前端自动连接到 `localhost:3001`，但后端在 `localhost:3000`。

## 解决方案

更新 `.env.local` 文件，设置正确的后端 URL。

### 步骤 1: 检查/创建 .env.local 文件

```bash
cd prediction-web

# 如果文件不存在，创建它
cat > .env.local << 'EOF'
# 本地开发环境配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
EOF
```

### 步骤 2: 验证配置

```bash
# 检查文件内容
cat .env.local

# 应该看到：
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 步骤 3: 重启前端开发服务器

```bash
# 停止当前运行的服务器 (Ctrl+C)

# 重新启动
npm run dev
```

## 环境变量说明

| 变量名 | 本地开发 | 说明 |
|--------|---------|------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | 后端 API 基础 URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 网站 URL（用于 SEO） |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-...` | Google OAuth Client ID |

## 注意事项

1. **必须重启服务器**：修改 `.env.local` 后需要重启 Next.js 开发服务器才能生效
2. **变量前缀**：`NEXT_PUBLIC_` 前缀的变量会在客户端代码中可用
3. **端口匹配**：确保 `NEXT_PUBLIC_API_BASE_URL` 的端口与后端一致（默认 3000）

## 验证连接

前端启动后，打开浏览器开发者工具，查看 Network 请求：

- ✅ 正确：请求发送到 `http://localhost:3000/api/...`
- ❌ 错误：请求发送到 `http://localhost:3001/...` 或其他 URL

## 常见问题

### Q: 修改后仍然连接到错误的 URL？

A: 
1. 确保文件名为 `.env.local`（不是 `.env`）
2. 重启开发服务器（`npm run dev`）
3. 清除 Next.js 缓存：删除 `.next` 文件夹后重启

### Q: 如何切换回 Railway 后端？

A: 在 `.env.local` 中修改：

```env
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
```

然后重启服务器。



