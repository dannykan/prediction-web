# 🔍 Cloudflare Pages 配置检查清单

## 需要检查的配置项

### 1. 构建配置
- [ ] **构建命令**: 应该是 `npm run build:cloudflare`
- [ ] **输出目录**: 应该是 `.open-next`（不是 `.vercel/output/static`）
- [ ] **根目录**: 应该是空或 `/`（如果仓库就是 prediction-web）

### 2. Git 集成
- [ ] **仓库**: 应该是 `dannykan/prediction-web`
- [ ] **生产分支**: 应该是 `main`
- [ ] **部署钩子**: 应该启用

### 3. 环境变量
- [ ] `NEXT_PUBLIC_API_BASE_URL`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 4. 部署状态
- [ ] 检查最近的部署是否成功
- [ ] 检查部署类型（应该是 `github:push`）
- [ ] 检查部署状态（应该是 `success`）

## 常见问题

### 问题 1: 构建输出目录错误
**症状**: 所有部署返回 404
**原因**: 输出目录设置为 `.vercel/output/static` 而不是 `.open-next`
**解决**: 更新为 `.open-next`

### 问题 2: Git 集成未启用
**症状**: 推送代码后没有自动部署
**原因**: Git 集成被禁用
**解决**: 在 Cloudflare Dashboard 中启用 Git 集成

### 问题 3: 环境变量缺失
**症状**: 网站功能不正常（如 Google 登录失败）
**原因**: 环境变量未设置
**解决**: 在 Cloudflare Dashboard 中设置环境变量
