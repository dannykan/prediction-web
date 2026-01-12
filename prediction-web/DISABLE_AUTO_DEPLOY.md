# 禁用自动部署指南

## 问题

即使删除了 GitHub Actions workflow，Cloudflare Pages 仍然在自动创建多个部署，导致：
- 每次推送代码都会创建多个部署
- 有些部署返回 404
- 需要手动检查哪个部署是正常的

## 解决方案

### 方法 1：在 Cloudflare Dashboard 中禁用自动部署（推荐）

1. **访问 Cloudflare Dashboard**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod

2. **进入 Settings**
   - 点击 **Settings** 标签

3. **进入 Builds & deployments**
   - 点击 **Builds & deployments**

4. **禁用自动部署**
   - 在 **Branch control** 部分，点击 **Edit**
   - 关闭 **Enable automatic production branch deployments**
   - 将 **Preview branch** 设置为 **None (Disable automatic branch deployments)**
   - 点击 **Save**

### 方法 2：使用 API 禁用（如果 Dashboard 方法不行）

已尝试通过 API 禁用，但可能需要使用不同的端点或参数。

## 当前正常工作的部署

- ✅ `dedde1ea` - 基于 commit `f892e553`，正常工作
- ✅ `27107868` - 基于 commit `f892e553`，正常工作

## 手动部署（禁用自动部署后）

禁用自动部署后，如果需要部署新版本：

### 方法 1：在 Cloudflare Dashboard 中手动触发

1. 访问部署页面
2. 点击 **"Create deployment"** 或 **"Retry deployment"**
3. 选择要部署的 commit
4. 点击 **"Deploy"**

### 方法 2：使用 Wrangler CLI

```bash
cd prediction-web
npm run build:cloudflare
wrangler pages deploy .open-next --project-name=predictiongod
```

### 方法 3：重新启用自动部署（如果需要）

如果以后需要自动部署，可以在 Dashboard 中重新启用。

## 立即操作

1. **在 Cloudflare Dashboard 中禁用自动部署**（如上所述）

2. **将 `dedde1ea` 提升为 Production**
   - 访问部署页面
   - 找到 `dedde1ea`
   - 点击 `...` 菜单，选择 "Promote to production"

3. **验证 Production 域名**
   - https://predictiongod.pages.dev
   - https://predictiongod.app
   - 确认网站正常显示

## 优势

✅ **完全控制** - 只有在你手动触发时才部署
✅ **避免混乱** - 不会再有多个自动部署
✅ **节省资源** - 不会浪费构建资源
✅ **更可靠** - 可以仔细检查每个部署

## 注意事项

1. **禁用自动部署后，推送代码不会自动部署**
   - 需要手动触发部署
   - 或者重新启用自动部署

2. **环境变量仍然需要在 Cloudflare Dashboard 中配置**
   - 即使禁用自动部署，环境变量配置仍然有效

3. **可以随时重新启用**
   - 如果以后需要自动部署，可以在 Dashboard 中重新启用
