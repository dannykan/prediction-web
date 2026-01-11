# 🔧 本地开发端口配置说明

## 端口分配

在本地开发环境中，前端和后端运行在不同端口：

- **后端 (NestJS)**: `http://localhost:3000`
- **前端 (Next.js)**: `http://localhost:3001`

这是**正常且推荐**的配置，因为：
- ✅ 避免端口冲突
- ✅ 前后端可以独立重启
- ✅ 更接近生产环境（前后端分离）

## 环境变量配置

确保 `.env.local` 文件包含：

```env
# 后端 API 基础 URL（指向 3000 端口）
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 前端网站 URL（指向 3001 端口）
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

## 重要说明

### `NEXT_PUBLIC_API_BASE_URL` vs `NEXT_PUBLIC_SITE_URL`

- **`NEXT_PUBLIC_API_BASE_URL`**: 指向**后端**（3000）
  - 用于所有 API 请求（`/api/auth/login`, `/api/me` 等）
  - 这些请求会转发到 `http://localhost:3000`

- **`NEXT_PUBLIC_SITE_URL`**: 指向**前端**（3001）
  - 用于 SEO、sitemap、robots.txt 等
  - 这是用户访问的网站地址

## 启动顺序

1. **启动后端**（端口 3000）:
   ```bash
   cd prediction-backend
   npm run start:dev
   ```

2. **启动前端**（端口 3001）:
   ```bash
   cd prediction-web
   npm run dev
   ```

前端会自动使用 3001 端口（已在 `package.json` 中配置）。

## 验证配置

### 1. 检查后端是否运行

```bash
curl http://localhost:3000/markets
```

应该返回 JSON 数据。

### 2. 检查前端是否运行

打开浏览器访问：`http://localhost:3001`

### 3. 检查 API 请求

打开浏览器开发者工具 → Network 标签：

- ✅ 正确：请求发送到 `http://localhost:3000/auth/login`
- ❌ 错误：请求发送到 `http://localhost:3001/...` 或其他 URL

## 常见问题

### Q: 为什么前端不能也用 3000？

A: 因为后端已经占用了 3000 端口。前后端分离架构中，它们应该运行在不同端口。

### Q: 如何更改端口？

**更改前端端口**（在 `package.json` 中）:
```json
"dev": "next dev -p 3002"  // 改为 3002
```

**更改后端端口**（在 `.env.local` 中）:
```env
PORT=3002
```

然后记得更新 `NEXT_PUBLIC_API_BASE_URL` 指向新的后端端口。

### Q: 前端请求失败怎么办？

1. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL` 是否正确
2. 确保后端正在运行（`curl http://localhost:3000/markets`）
3. 重启前端服务器（修改 `.env.local` 后需要重启）

## 总结

✅ **正常配置**：
- 后端：`localhost:3000`
- 前端：`localhost:3001`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`（指向后端）
- `NEXT_PUBLIC_SITE_URL=http://localhost:3001`（指向前端）

这样前端就能正确调用后端 API 了！



