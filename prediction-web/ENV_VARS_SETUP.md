# 环境变量设置指南

## 问题

部署后出现以下错误：
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` - Google 登录功能无法使用

## 解决方案

需要在 GitHub Secrets 中添加 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 环境变量。

### 步骤 1：获取 Google Client ID

根据本地开发配置，Google Client ID 应该是：
```
533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

如果这个值不正确，请检查：
1. Google Cloud Console: https://console.cloud.google.com/
2. APIs & Services → Credentials
3. 找到 OAuth 2.0 Client ID（Web application 类型）

### 步骤 2：在 GitHub Secrets 中添加

1. **访问 GitHub Repository Settings**
   - 网址：https://github.com/dannykan/prediction-web/settings/secrets/actions

2. **添加新的 Secret**
   - 点击 **"New repository secret"**
   - Name: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Value: `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`
   - 点击 **"Add secret"**

### 步骤 3：验证

添加后，下次部署时会自动包含这个环境变量。可以：

1. **触发新的部署**
   ```bash
   git commit --allow-empty -m "chore: Trigger deployment with Google Client ID"
   git push
   ```

2. **检查部署日志**
   - 访问：https://github.com/dannykan/prediction-web/actions
   - 查看最新的部署日志
   - 确认构建过程中没有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 错误

3. **测试 Google 登录**
   - 访问：https://predictiongod.app
   - 尝试使用 Google 登录
   - 确认不再出现 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 错误

## 当前已设置的环境变量

在 GitHub Actions workflow 中已配置的环境变量：

- ✅ `NEXT_PUBLIC_API_BASE_URL` - API 基础 URL
- ✅ `NEXT_PUBLIC_SITE_URL` - 网站 URL
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID（需要添加到 Secrets）

## 其他错误说明

### 401 Unauthorized (`/api/me`)

这是正常的，表示用户未登录。登录后这个错误会消失。

### 500 Internal Server Error (`/api/markets`)

这是后端 API 的问题，不是前端部署的问题。需要检查：
- 后端服务是否正常运行
- API 端点是否正确配置
- 数据库连接是否正常

## 注意事项

1. **环境变量命名**
   - Next.js 中，客户端可访问的环境变量必须以 `NEXT_PUBLIC_` 开头
   - 这些变量会在构建时被嵌入到客户端代码中

2. **安全性**
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是公开的，可以安全地嵌入到客户端代码中
   - 但不要将敏感信息（如 API keys、secrets）放在 `NEXT_PUBLIC_` 变量中

3. **重新部署**
   - 添加新的环境变量后，需要重新部署才能生效
   - 环境变量在构建时被嵌入，不是运行时读取的
