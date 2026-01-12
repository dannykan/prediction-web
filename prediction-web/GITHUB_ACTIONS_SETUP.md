# 🚀 GitHub Actions 部署设置

## 为什么使用 GitHub Actions？

Cloudflare Pages 的 Git 集成一直遇到 submodule 问题，即使做了所有修复仍然失败。使用 GitHub Actions 可以：

- ✅ 完全控制 Git 克隆过程（禁用 submodule）
- ✅ 避免 Cloudflare Pages Git 集成的问题
- ✅ 更灵活的构建和部署流程
- ✅ 更好的错误日志和调试

## 设置步骤

### 1. 设置 GitHub Secrets

访问：https://github.com/dannykan/prediction-web/settings/secrets/actions

添加以下 Secrets：

#### CLOUDFLARE_API_TOKEN
- 获取方式：https://dash.cloudflare.com/profile/api-tokens
- 创建新 Token，权限：`Cloudflare Pages:Edit`

#### CLOUDFLARE_ACCOUNT_ID
- 值：`3f788981872971344ab14a8fcafa5c8f`
- 可以在 Cloudflare Dashboard 中找到

#### NEXT_PUBLIC_API_BASE_URL
- 值：你的后端 API URL（例如：`https://prediction-backend-production-8f6c.up.railway.app`）

#### NEXT_PUBLIC_SITE_URL
- 值：`https://predictiongod.app`

#### NEXT_PUBLIC_GOOGLE_CLIENT_ID
- 值：你的 Google OAuth Client ID

## 工作流程

### 自动触发

每次推送到 `main` 分支时，GitHub Actions 会自动：

1. ✅ 克隆仓库（禁用 submodule）
2. ✅ 安装依赖
3. ✅ 构建项目
4. ✅ 部署到 Cloudflare Pages

### 手动触发

也可以在 GitHub Actions 页面手动触发：
1. 访问：https://github.com/dannykan/prediction-web/actions
2. 选择 "Deploy to Cloudflare Pages"
3. 点击 "Run workflow"

## 优势

### vs Cloudflare Pages Git 集成

| 特性 | GitHub Actions | Cloudflare Git 集成 |
|------|---------------|---------------------|
| Submodule 控制 | ✅ 完全控制 | ❌ 自动尝试更新 |
| 构建日志 | ✅ 详细日志 | ⚠️ 有限 |
| 错误调试 | ✅ 容易 | ⚠️ 困难 |
| 灵活性 | ✅ 高 | ⚠️ 低 |

## 当前状态

- ✅ GitHub Actions workflow 已创建
- ⏳ 等待设置 GitHub Secrets
- ⏳ 第一次运行后验证

## 下一步

1. **设置 GitHub Secrets**（见上方）
2. **推送代码触发第一次部署**
3. **验证部署成功**

## 如果 GitHub Actions 也失败

检查：
- GitHub Secrets 是否正确设置
- 构建日志中的错误信息
- 环境变量是否正确

## 禁用 Cloudflare Pages Git 集成（可选）

如果 GitHub Actions 工作正常，可以禁用 Cloudflare Pages 的 Git 集成：

1. 访问 Cloudflare Dashboard
2. 进入 Pages 项目设置
3. 断开 Git 连接
4. 只使用 GitHub Actions 部署

这样可以避免两个部署系统冲突。
