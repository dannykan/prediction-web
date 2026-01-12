# 部署策略说明

## 问题总结

经过多次测试，发现：

### GitHub Actions 部署（`cloudflare/pages-action@v1`）
- ❌ 经常失败，返回 404 错误
- ❌ `_worker.js` 文件可能没有被正确上传
- ❌ 部署状态显示 "success" 但实际无法访问

### Cloudflare Git 集成部署
- ✅ 部署成功率高
- ✅ `_worker.js` 文件正确上传
- ✅ 网站可以正常访问

## 当前策略

**已禁用 GitHub Actions 自动部署**

原因：
1. `cloudflare/pages-action@v1` 已被弃用（2024年10月）
2. 在处理 `_worker.js` 文件时存在问题
3. Cloudflare Git 集成更可靠

## 部署方式

### 自动部署（推荐）

**Cloudflare Pages Git 集成**

1. 代码推送到 `main` 分支
2. Cloudflare 自动检测并部署
3. 部署会自动包含所有必要的文件（包括 `_worker.js`）

### 手动部署（如果需要）

如果需要手动触发部署，可以：

1. **使用 GitHub Actions（手动触发）**
   - 访问：https://github.com/dannykan/prediction-web/actions
   - 点击 "Deploy to Cloudflare Pages" workflow
   - 点击 "Run workflow" 按钮
   - 选择分支并运行

2. **使用 Wrangler CLI**
   ```bash
   cd prediction-web
   npm run build:cloudflare
   wrangler pages deploy .open-next --project-name=predictiongod
   ```

## 验证部署

部署完成后，检查：

1. **部署状态**
   - Cloudflare Dashboard → Deployments
   - 确认状态为 "Success"

2. **网站访问**
   - 访问预览 URL（例如：`https://<deployment-id>.predictiongod.pages.dev`）
   - 确认返回 307 重定向（不是 404）

3. **静态资源**
   - 检查 `/_next/static/*` 路径
   - 确认 CSS、JS 文件可以访问

4. **Worker 文件**
   - 检查 `/_worker.js` 是否存在（虽然可能返回 404，但这是正常的，因为它是内部使用的）

## 环境变量

确保以下环境变量在 Cloudflare Pages 中配置：

1. **构建时环境变量**（在 GitHub Secrets 中）
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

2. **Cloudflare Pages 环境变量**（如果需要）
   - 在 Cloudflare Dashboard → Settings → Environment variables 中配置

## 故障排除

### 如果部署返回 404

1. **检查 `_worker.js` 是否存在**
   ```bash
   curl -I https://<deployment-id>.predictiongod.pages.dev/_worker.js
   ```

2. **检查构建输出**
   - 查看 GitHub Actions 日志（如果使用）
   - 或查看 Cloudflare Pages 构建日志

3. **回滚到正常工作的部署**
   - 在 Cloudflare Dashboard 中找到正常工作的部署
   - 点击 "Promote to production"

### 如果静态资源 404

1. **检查 `fix-worker.js` 脚本**
   - 确认脚本正确执行
   - 确认 `_next` 和 `images` 目录被复制到根目录

2. **检查 `_worker.js` 中的静态资源处理**
   - 确认静态资源处理代码已添加
   - 确认 `env.ASSETS` 绑定正确

## 未来改进

考虑迁移到 `wrangler-action`：
- `cloudflare/pages-action@v1` 已被弃用
- `wrangler-action` 是官方推荐的新方式
- 可能能更好地处理 `_worker.js` 文件

## 当前正常工作的部署

- ✅ `27107868` - 基于 commit `f892e553`
- ✅ `17f7c506` - 基于 commit `f892e553`

如果新部署失败，可以回滚到这些正常工作的版本。
