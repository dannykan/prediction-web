# 手动部署指南

## ✅ 已完成的配置

### 1. 禁用所有自动部署

已通过 API 禁用：
- ✅ Production 自动部署：已禁用
- ✅ Preview 自动部署：已禁用（设置为 "none"）
- ✅ 所有 Git 集成自动部署：已禁用

### 2. 删除 GitHub Actions 工作流

已删除 `.github/workflows/deploy-cloudflare.yml`，不再有 GitHub Actions 部署。

## 当前状态

**现在不会有任何自动部署！**

推送代码到 `main` 分支不会触发任何部署。所有部署都需要手动触发。

## 正常工作的部署

- ✅ `dedde1ea` - Cloudflare Git 集成部署，正常工作
- ✅ `27107868` - Cloudflare Git 集成部署，正常工作

## 手动部署方法

### 方法 1：在 Cloudflare Dashboard 中手动触发（推荐）

1. **访问 Cloudflare Dashboard**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

2. **创建新部署**
   - 点击 **"Create deployment"** 或 **"Retry deployment"** 按钮
   - 选择要部署的 commit（例如：最新的 commit）
   - 点击 **"Deploy"**

3. **等待部署完成**
   - 通常需要 5-10 分钟
   - 在部署列表中查看进度

4. **验证部署**
   - 访问预览 URL
   - 确认返回 307 重定向（不是 404）
   - 确认网站正常显示

5. **提升为 Production**
   - 如果部署正常，点击 `...` 菜单
   - 选择 **"Promote to production"**

### 方法 2：使用 Wrangler CLI

```bash
cd prediction-web

# 构建
npm run build:cloudflare

# 部署
wrangler pages deploy .open-next \
  --project-name=predictiongod \
  --branch=main \
  --commit-dirty=true
```

需要先安装 Wrangler：
```bash
npm install -g wrangler
wrangler login
```

### 方法 3：重新部署正常工作的版本

如果需要快速恢复，可以重新部署 `dedde1ea`：

1. 在 Cloudflare Dashboard 中找到 `dedde1ea`
2. 点击 `...` 菜单
3. 选择 **"Retry deployment"**
4. 等待部署完成
5. 提升为 Production

## 部署流程

### 标准流程

1. **开发代码**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **手动触发部署**（在 Cloudflare Dashboard）

3. **等待部署完成**（5-10 分钟）

4. **验证部署**
   - 检查预览 URL
   - 测试功能

5. **提升为 Production**（如果正常）

## 优势

✅ **完全控制** - 只有在你手动触发时才部署
✅ **避免混乱** - 不会再有多个自动部署
✅ **节省资源** - 不会浪费构建资源
✅ **更可靠** - 可以仔细检查每个部署
✅ **避免 404** - 可以确保只部署正常工作的版本

## 环境变量配置

**必须在 Cloudflare Dashboard 中配置：**

访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings/environment-variables

为 Production 环境添加：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 立即操作

### 1. 将 `dedde1ea` 提升为 Production

访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

找到 `dedde1ea`，点击 `...` 菜单，选择 **"Promote to production"**。

### 2. 配置环境变量

在 Cloudflare Dashboard 中添加环境变量（如上所述）。

### 3. 验证 Production 域名

- https://predictiongod.pages.dev
- https://predictiongod.app

确认网站正常显示。

## 注意事项

1. **禁用自动部署后，推送代码不会自动部署**
   - 必须手动触发部署
   - 或者重新启用自动部署（如果需要）

2. **可以随时重新启用自动部署**
   - 在 Cloudflare Dashboard → Settings → Builds & deployments
   - 重新启用 "Enable automatic production branch deployments"

3. **环境变量仍然需要在 Cloudflare Dashboard 中配置**
   - 即使禁用自动部署，环境变量配置仍然有效

## 故障排除

### 如果手动部署返回 404

1. **检查构建日志**
   - 在 Cloudflare Dashboard 中查看构建日志
   - 确认 `fix-worker.js` 脚本执行成功
   - 确认 `_worker.js` 文件被创建

2. **回滚到正常工作的部署**
   - 找到 `dedde1ea` 或 `27107868`
   - 点击 "Retry deployment"
   - 或直接 "Promote to production"

### 如果部署被跳过

- 可能是 Cloudflare 检测到没有实际代码更改
- 这是正常的，可以忽略
