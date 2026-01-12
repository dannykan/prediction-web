# 🔧 立即设置环境变量（通过 Dashboard）

## 问题

Google 登录失败，因为 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 未设置。

## 解决步骤

### 1. 访问 Cloudflare Pages 设置

打开以下链接：
**https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings**

### 2. 找到 "Environment variables" 部分

向下滚动，找到 **"Environment variables"** 部分。

### 3. 设置 Production 环境变量

点击 **"Add variable"** 或 **"Edit variables"**，添加以下三个变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-production-8f6c.up.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://predictiongod.app` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com` |

**重要：** 确保选择 **"Production"** 环境。

### 4. 设置 Preview 环境变量

同样添加上述三个变量，但选择 **"Preview"** 环境。

### 5. 保存设置

点击 **"Save"** 或 **"Save and Deploy"**。

### 6. 重新部署

环境变量在构建时被嵌入，需要重新部署才能生效。

**方法 1：使用部署脚本（推荐）**
```bash
cd prediction-web
./deploy.sh
```

**方法 2：通过 Dashboard 手动触发**
1. 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments
2. 点击 **"Create deployment"** 或 **"Retry deployment"**
3. 选择最新的 commit

## ✅ 验证

部署完成后（约 2-3 分钟）：

1. **访问网站**
   - https://predictiongod.app

2. **打开开发者工具**（F12）

3. **检查 Console**
   - 应该不再有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 错误

4. **测试 Google 登录**
   - 点击登录按钮
   - 应该能正常弹出 Google 登录窗口

## 📝 当前状态

- ✅ Preview 环境已有 `NEXT_PUBLIC_API_BASE_URL` 和 `NEXT_PUBLIC_SITE_URL`
- ❌ Preview 环境缺少 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- ❌ Production 环境缺少所有三个变量

## 🎯 需要设置的值

```
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

复制这些值，在 Dashboard 中设置即可。
