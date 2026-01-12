# 🔐 Google OAuth 生产环境修复指南

## 当前问题

1. **`origin_mismatch` 错误** - Google OAuth 不允许从 `predictiongod.app` 登录
2. **后端 `GOOGLE_CLIENT_ID` 未配置** - 后端无法验证 Google ID Token

## 🔧 修复步骤

### 步骤 1：在 Google Cloud Console 添加授权域名

1. **访问 Google Cloud Console**
   - https://console.cloud.google.com/
   - 选择项目：`prediction-god`

2. **进入 API 和凭据页面**
   - 左侧菜单：**API 和凭据** (APIs & Services) → **凭据** (Credentials)
   - 找到 OAuth 2.0 客户端 ID：`533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8`

3. **编辑 OAuth 客户端**
   - 点击该客户端 ID
   - 找到 **已授权的 JavaScript 来源** (Authorized JavaScript origins)
   - 点击 **+ 添加 URI** (Add URI)
   - 添加以下来源：

```
https://predictiongod.app
https://predictiongod.pages.dev
http://localhost:3001
http://localhost:3000
```

**重要提示：**
- ✅ 必须包含协议（`https://`）
- ✅ 不要包含路径（如 `/login`）
- ✅ 每个域名单独一行

4. **添加已授权的重定向 URI**（如果需要）
   - 在 **已授权的重定向 URI** (Authorized redirect URIs) 部分
   - 添加：

```
https://predictiongod.app
https://predictiongod.pages.dev
http://localhost:3001
http://localhost:3000
```

5. **保存更改**
   - 点击 **保存** (Save)
   - 等待 1-2 分钟让更改生效

### 步骤 2：在后端（Railway）设置 `GOOGLE_CLIENT_ID`

1. **访问 Railway Dashboard**
   - https://railway.app/
   - 选择项目：`prediction-backend-production`

2. **进入服务设置**
   - 点击后端服务
   - 进入 **Variables** 标签

3. **添加环境变量**
   - 点击 **+ New Variable**
   - 变量名：`GOOGLE_CLIENT_ID`
   - 变量值：`533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`
   - 点击 **Add**

4. **重启服务**（如果需要）
   - Railway 通常会自动重启
   - 如果环境变量没有生效，可以手动重启服务

## 📋 配置清单

### Google Cloud Console 配置

**已授权的 JavaScript 来源：**
```
https://predictiongod.app
https://predictiongod.pages.dev
http://localhost:3001
http://localhost:3000
```

**已授权的重定向 URI：**
```
https://predictiongod.app
https://predictiongod.pages.dev
http://localhost:3001
http://localhost:3000
```

### Railway 后端环境变量

```
GOOGLE_CLIENT_ID=533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

## ✅ 验证修复

### 1. 验证 Google Cloud Console 配置

等待 1-2 分钟后：
1. 清除浏览器缓存
2. 访问：https://predictiongod.app
3. 点击 Google 登录按钮
4. 应该不再出现 `origin_mismatch` 错误

### 2. 验证后端配置

检查后端日志：
1. 在 Railway Dashboard 中查看服务日志
2. 尝试登录
3. 应该不再看到 `Google Client ID not configured` 错误

### 3. 完整测试

1. **访问网站**
   - https://predictiongod.app

2. **点击 Google 登录**
   - 应该能正常弹出 Google 登录窗口
   - 不再出现 `origin_mismatch` 错误

3. **完成登录**
   - 选择 Google 账户
   - 应该能成功登录
   - 不再出现 `Google Client ID not configured` 错误

## 🚨 常见错误

### 错误 1: 忘记添加协议

❌ 错误：`predictiongod.app`
✅ 正确：`https://predictiongod.app`

### 错误 2: 包含路径

❌ 错误：`https://predictiongod.app/login`
✅ 正确：`https://predictiongod.app`

### 错误 3: 环境变量名称错误

❌ 错误：`NEXT_PUBLIC_GOOGLE_CLIENT_ID`（这是前端的）
✅ 正确：`GOOGLE_CLIENT_ID`（后端的）

### 错误 4: 更改未生效

- Google Cloud Console 的更改可能需要 1-2 分钟生效
- Railway 环境变量更改后服务会自动重启
- 清除浏览器缓存和 Cookie
- 使用无痕模式测试

## 📝 环境变量说明

### 前端（Cloudflare Pages）

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - 用于初始化 Google Sign-In
- 已经在 Cloudflare Dashboard 中设置

### 后端（Railway）

- `GOOGLE_CLIENT_ID` - 用于验证 Google ID Token
- **需要现在添加**

## 🎯 优先级

**高优先级** - 这两个问题都会阻止用户登录：
1. ✅ 先修复 Google Cloud Console 配置（解决 `origin_mismatch`）
2. ✅ 再修复 Railway 环境变量（解决后端验证问题）

## 📞 需要帮助？

如果仍然遇到问题：

1. **检查 Google Cloud Console**
   - 确认所有域名都已添加
   - 确认更改已保存

2. **检查 Railway 环境变量**
   - 确认 `GOOGLE_CLIENT_ID` 已设置
   - 确认值正确（包含 `.apps.googleusercontent.com`）

3. **检查后端日志**
   - 在 Railway Dashboard 中查看日志
   - 查找相关错误信息

4. **清除浏览器缓存**
   - 使用无痕模式测试
   - 清除所有 Cookie 和缓存
