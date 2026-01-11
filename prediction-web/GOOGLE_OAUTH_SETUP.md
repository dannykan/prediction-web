# 🔐 Google OAuth 2.0 配置指南

## 错误信息

```
Error 400: origin_mismatch
Access blocked: Authorization Error
```

## 原因

前端运行的域名（`localhost:3001`）没有被添加到 Google Cloud Console 的授权 JavaScript 来源中。

## 🔧 修复步骤

### 步骤 1: 打开 Google Cloud Console

1. 访问：https://console.cloud.google.com/
2. 选择你的项目（或创建新项目）

### 步骤 2: 进入 API 和凭据页面

1. 左侧菜单：**API 和凭据** (APIs & Services) → **凭据** (Credentials)
2. 找到你的 OAuth 2.0 客户端 ID（Client ID）
   - Client ID: `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`

### 步骤 3: 编辑 OAuth 客户端

1. 点击你的 OAuth 2.0 客户端 ID
2. 在 **已授权的 JavaScript 来源** (Authorized JavaScript origins) 部分
3. 点击 **+ 添加 URI** (Add URI)
4. 添加以下来源：

```
http://localhost:3001
http://localhost:3000
```

**注意**：
- ✅ 不要包含路径（如 `/login`）
- ✅ 必须包含协议（`http://` 或 `https://`）
- ✅ 本地开发使用 `http://`（不是 `https://`）

### 步骤 4: 添加已授权的重定向 URI（如果需要）

在 **已授权的重定向 URI** (Authorized redirect URIs) 部分，添加：

```
http://localhost:3001
http://localhost:3000
```

### 步骤 5: 保存更改

1. 点击 **保存** (Save)
2. 等待 1-2 分钟让更改生效

### 步骤 6: 测试

1. 刷新前端页面：`http://localhost:3001/login`
2. 再次点击 Google 登录按钮
3. 应该可以正常弹出 Google 登录窗口

## 📋 配置清单

确保 Google Cloud Console 中的 OAuth 客户端配置包含：

### 已授权的 JavaScript 来源 (Authorized JavaScript origins)

```
http://localhost:3001
http://localhost:3000
```

### 已授权的重定向 URI (Authorized redirect URIs)

```
http://localhost:3001
http://localhost:3000
```

### 应用类型

- ✅ Web 应用程序 (Web application)

## 🚨 常见错误

### 错误 1: 忘记添加端口号

❌ 错误：`http://localhost`
✅ 正确：`http://localhost:3001`

### 错误 2: 使用 https

❌ 错误：`https://localhost:3001`
✅ 正确：`http://localhost:3001`（本地开发）

### 错误 3: 包含路径

❌ 错误：`http://localhost:3001/login`
✅ 正确：`http://localhost:3001`

### 错误 4: 更改未生效

- Google Cloud Console 的更改可能需要 1-2 分钟生效
- 清除浏览器缓存和 Cookie
- 使用无痕模式测试

## 🎯 生产环境配置

当部署到生产环境时，需要添加生产域名：

### 已授权的 JavaScript 来源

```
https://your-domain.com
https://www.your-domain.com
```

### 已授权的重定向 URI

```
https://your-domain.com
https://www.your-domain.com
```

## ✅ 验证配置

配置完成后，应该能够：

1. ✅ 在 `http://localhost:3001/login` 看到 Google 登录按钮
2. ✅ 点击按钮后弹出 Google 登录窗口
3. ✅ 选择账户后成功登录
4. ✅ 重定向到 `/wallet` 页面

## 📞 需要帮助？

如果仍然遇到问题：

1. **检查环境变量**：
   ```bash
   # 在 prediction-web 目录
   echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
   ```

2. **检查浏览器控制台**：
   - 打开开发者工具 → Console
   - 查看是否有其他错误信息

3. **使用无痕模式**：
   - 清除浏览器缓存和 Cookie
   - 使用无痕窗口测试

4. **检查 Google Cloud Console**：
   - 确认 OAuth 同意屏幕已配置
   - 确认测试用户已添加（如果需要）



