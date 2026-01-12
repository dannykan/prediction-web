# 快速修复：环境变量设置

## ✅ 已通过 API 设置环境变量

我已经通过 Cloudflare API 设置了以下环境变量：

### Production 环境：
- ✅ `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`

### Preview 环境：
- ✅ `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com`

## 🚀 下一步：重新部署

环境变量在构建时被嵌入，需要重新部署才能生效：

```bash
cd prediction-web
./deploy.sh
```

或者通过 Cloudflare Dashboard 手动触发部署。

## ✅ 验证

部署完成后（约 2-3 分钟）：

1. **访问网站**
   - https://predictiongod.app

2. **检查控制台**
   - 打开开发者工具（F12）
   - 应该不再有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 错误

3. **测试 Google 登录**
   - 点击登录按钮
   - 应该能正常弹出 Google 登录窗口

## 📝 如果通过 Dashboard 设置

如果 API 设置失败，可以通过 Dashboard 手动设置：

1. 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings

2. 找到 "Environment variables" 部分

3. 添加上述三个环境变量（Production 和 Preview 都要设置）

4. 保存并重新部署
