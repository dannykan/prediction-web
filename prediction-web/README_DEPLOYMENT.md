# 部署说明

## ✅ 当前配置

**已完全断开 Git 集成，改为手动上传模式**

- ✅ Git 集成：已断开
- ✅ 自动部署：已完全禁用
- ✅ 部署方式：手动使用 Wrangler CLI

## 🚀 部署方法（唯一方式）

### 使用部署脚本（推荐）

```bash
cd prediction-web
./deploy.sh
```

这个脚本会：
1. 构建项目（`npm run build:cloudflare`）
2. 验证构建输出（检查 `_worker.js` 和静态资源）
3. 部署到 Cloudflare Pages（使用 Wrangler CLI）

### 手动部署

```bash
cd prediction-web

# 1. 构建
npm run build:cloudflare

# 2. 部署
wrangler pages deploy .open-next --project-name=predictiongod
```

## 📋 部署前准备

### 1. 安装 Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. 配置环境变量

在 Cloudflare Dashboard 中配置：
- 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings/environment-variables

添加以下环境变量（Production 环境）：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**注意：** 环境变量需要在 Cloudflare Dashboard 中配置，因为现在是手动上传模式。

## ✅ 优势

- ✅ **单一部署** - 每次只有一个部署
- ✅ **完全控制** - 只有你运行脚本时才部署
- ✅ **简单明了** - 不需要检查多个部署
- ✅ **可靠** - 使用与 `c04ebc5d` 相同的方式

## 📝 部署流程

1. **开发代码**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **手动部署**
   ```bash
   cd prediction-web
   ./deploy.sh
   ```

3. **等待部署完成**（约 5-10 分钟）

4. **验证部署**
   - 访问预览 URL
   - 确认网站正常显示

5. **提升为 Production**（如果需要）
   - 在 Cloudflare Dashboard 中
   - 找到部署，点击 `...` 菜单
   - 选择 "Promote to production"

## 🔍 验证部署

部署完成后，检查：

- [ ] 网站可以访问（返回 307 重定向，不是 404）
- [ ] 静态资源正常加载（CSS、JS、图片）
- [ ] Google 登录功能正常（如果配置了环境变量）
- [ ] API 调用正常（后端相关）

## 🐛 故障排除

### 如果部署返回 404

1. **检查构建输出**
   ```bash
   ls -la .open-next/_worker.js
   ls -la .open-next/_next
   ```

2. **重新部署**
   ```bash
   ./deploy.sh
   ```

### 如果环境变量不生效

1. **确认在 Cloudflare Dashboard 中配置**
   - Settings → Environment variables
   - 确认是 Production 环境

2. **重新部署**
   - 环境变量在构建时嵌入
   - 需要重新构建和部署

## 📌 当前正常工作的部署

- ✅ `c04ebc5d` - 正常工作，已设置为 Production

如果新部署失败，可以回滚到这个版本。

## 🎯 总结

**现在：**
- ✅ 不会有任何自动部署
- ✅ 每次只有一个手动部署
- ✅ 完全控制部署时机
- ✅ 简单明了

**使用方式：**
```bash
./deploy.sh
```

就这么简单！
