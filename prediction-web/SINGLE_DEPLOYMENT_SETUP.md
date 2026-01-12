# 单一部署源配置

## ✅ 已完成的配置

### 1. 删除 GitHub Actions 部署工作流

已删除 `.github/workflows/deploy-cloudflare.yml`，避免 GitHub Actions 触发部署。

### 2. 使用 Cloudflare Git 集成（唯一部署方式）

**这是 `dedde1ea` 使用的部署方式：**
- 来源：`github:push`（Cloudflare Git 集成）
- 构建命令：`npm run build:cloudflare`
- 输出目录：`.open-next`
- 根目录：`prediction-web`

## 当前配置

### Cloudflare Pages 项目配置

在 Cloudflare Dashboard 中配置：
- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `.open-next`
- **Root directory**: `prediction-web`
- **Production branch**: `main`

### 环境变量配置

**必须在 Cloudflare Dashboard 中配置：**

访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings/environment-variables

添加以下环境变量（Production 环境）：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 部署流程

### 自动部署（唯一方式）

1. **推送代码到 `main` 分支**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Cloudflare 自动检测并部署**
   - Cloudflare 检测到 `main` 分支的推送
   - 读取 `wrangler.toml` 配置
   - 执行构建命令：`npm run build:cloudflare`
   - 部署 `.open-next` 目录
   - 正确处理 `_worker.js` 文件

3. **等待部署完成**
   - 构建通常需要 5-10 分钟
   - 在 Cloudflare Dashboard 查看进度

### 验证部署

部署完成后：
1. 访问预览 URL（例如：`https://<deployment-id>.predictiongod.pages.dev`）
2. 确认返回 307 重定向（不是 404）
3. 确认网站正常显示
4. 如果正常，提升为 Production

## 提升为 Production

1. 访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments
2. 找到正常工作的部署
3. 点击右侧的 `...` 菜单
4. 选择 **"Promote to production"**

## 优势

✅ **单一部署源** - 不会再有多个部署同时出现
✅ **可靠性高** - Cloudflare Git 集成能正确处理 `_worker.js`
✅ **自动化** - 推送代码后自动部署
✅ **简单** - 不需要维护 GitHub Actions workflow

## 注意事项

1. **环境变量必须在 Cloudflare Dashboard 中配置**
   - GitHub Secrets 不会被 Cloudflare Git 集成使用
   - 必须在 Cloudflare Dashboard 中手动添加

2. **构建配置在 `wrangler.toml` 中**
   - `pages_build_output_dir = ".open-next"`
   - Cloudflare 会自动读取这个配置

3. **每次推送都会触发部署**
   - 包括文档文件的修改
   - 如果不想部署，可以在 commit message 中添加 `[skip ci]`

## 故障排除

### 如果部署失败

1. **检查构建日志**
   - Cloudflare Dashboard → Deployments → 点击失败的部署
   - 查看构建日志中的错误信息

2. **检查环境变量**
   - 确认所有必要的环境变量都已配置
   - 确认变量名称正确（区分大小写）

3. **检查 `wrangler.toml`**
   - 确认 `pages_build_output_dir` 正确
   - 确认路径是相对路径（不是绝对路径）

### 如果部署返回 404

1. **检查 `_worker.js` 是否存在**
   - 查看构建日志，确认 `fix-worker.js` 脚本执行成功
   - 确认 `_worker.js` 文件被创建

2. **回滚到正常工作的部署**
   - 找到之前正常工作的部署（例如：`dedde1ea`）
   - 点击 "Promote to production"

## 当前正常工作的部署

- ✅ `dedde1ea` - Cloudflare Git 集成部署，正常工作

如果新部署失败，可以回滚到这个版本。
