# 修复 Production 部署问题

## 问题描述

目前有三个部署都标记为 production，但 Cloudflare Pages 选择了有问题的部署（`2d358b13`）作为实际的 production。

### 部署状态

- ✅ `e3e15f27`（commit `f892e55`）- **正常工作**，返回 307 重定向
- ❌ `2d358b13`（commit `8e48d28`）- **有问题**，返回 404 错误
- ✅ `6467acde`（commit `f892e55`）- GitHub Actions 部署

## 解决方案

### 方法 1：在 Cloudflare Dashboard 手动切换（推荐，立即生效）

1. **访问 Cloudflare Dashboard**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

2. **找到正常工作的部署**
   - 查找部署 ID：`e3e15f27`
   - 确认它显示为 "Success" 状态

3. **提升为 Production**
   - 点击 `e3e15f27` 部署右侧的 `...`（三个点）菜单
   - 选择 **"Promote to production"** 或 **"Set as production"**
   - 等待几秒钟让更改生效

4. **验证**
   - 访问 https://predictiongod.pages.dev
   - 访问 https://predictiongod.app
   - 确认网站正常显示且没有 404 错误

### 方法 2：禁用 Cloudflare Pages Git 集成（避免未来重复部署）

为了避免未来再次出现多个部署的情况，建议禁用 Cloudflare Pages 的 Git 集成，只使用 GitHub Actions：

1. **访问 Cloudflare Dashboard**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod

2. **进入设置**
   - 点击 **Settings** 标签
   - 点击 **Builds & deployments**

3. **禁用自动部署**
   - 在 **Branch control** 部分，点击 **Edit**
   - 关闭 **Enable automatic production branch deployments**
   - 将 **Preview branch** 设置为 **None (Disable automatic branch deployments)**
   - 点击 **Save**

这样以后只会通过 GitHub Actions 部署，避免重复部署的问题。

## 为什么会有多个部署？

同时启用了两个部署源：
1. **GitHub Actions**（`ad_hoc`）- 通过 `.github/workflows/deploy-cloudflare.yml` 部署
2. **Cloudflare Pages Git 集成**（`github:push`）- Cloudflare 自动检测 GitHub push 并部署

这导致同一个 commit 可能被部署多次。

## 预防措施

为了避免未来再次出现这个问题：

1. ✅ 禁用 Cloudflare Pages 的 Git 集成（如上所述）
2. ✅ 只使用 GitHub Actions 进行部署
3. ✅ 确保 `cloudflare/pages-action@v1` 正确配置

## 验证修复

修复后，验证以下内容：

1. **Production 域名正常**
   - https://predictiongod.pages.dev
   - https://predictiongod.app

2. **静态资源正常加载**
   - CSS 文件：`/_next/static/css/*.css`
   - JS 文件：`/_next/static/chunks/*.js`
   - 图片：`/images/*.png`

3. **页面正常显示**
   - UI/UX 样式正确
   - 没有 404 错误
   - 没有控制台错误
