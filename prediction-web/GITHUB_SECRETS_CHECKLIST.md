# ✅ GitHub Secrets 检查清单

## 必需的 Secrets

请在 GitHub 仓库设置中确认以下 Secrets 已正确设置：

访问：https://github.com/dannykan/prediction-web/settings/secrets/actions

### 1. CLOUDFLARE_API_TOKEN ⚠️ 关键
- **名称必须完全匹配**：`CLOUDFLARE_API_TOKEN`（全部大写，下划线）
- **获取方式**：
  1. 访问：https://dash.cloudflare.com/profile/api-tokens
  2. 点击 "Create Token"
  3. 使用模板 "Edit Cloudflare Workers" 或自定义：
     - Account > Cloudflare Pages > Edit
  4. 复制 Token 并添加到 GitHub Secrets

### 2. CLOUDFLARE_ACCOUNT_ID
- **名称**：`CLOUDFLARE_ACCOUNT_ID`
- **值**：`3f788981872971344ab14a8fcafa5c8f`

### 3. NEXT_PUBLIC_API_BASE_URL
- **名称**：`NEXT_PUBLIC_API_BASE_URL`
- **值**：你的后端 API URL（例如：`https://prediction-backend-production-8f6c.up.railway.app`）

### 4. NEXT_PUBLIC_SITE_URL
- **名称**：`NEXT_PUBLIC_SITE_URL`
- **值**：`https://predictiongod.app`

### 5. NEXT_PUBLIC_GOOGLE_CLIENT_ID
- **名称**：`NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **值**：你的 Google OAuth Client ID

## 常见错误

### "Input required and not supplied: apiToken"

**原因**：`CLOUDFLARE_API_TOKEN` Secret 未设置或名称不匹配

**解决**：
1. 检查 Secret 名称是否完全匹配（区分大小写）
2. 确认 Secret 已保存
3. 重新运行 workflow

### "The process '/usr/bin/git' failed with exit code 128"

**原因**：Git 操作失败（可能是 submodule 或其他 Git 问题）

**解决**：
- 已通过 `submodules: false` 禁用 submodule
- 已添加 `working-directory` 指定工作目录

## 验证 Secret 设置

1. 访问：https://github.com/dannykan/prediction-web/settings/secrets/actions
2. 确认所有 5 个 Secrets 都存在
3. 检查名称是否完全匹配（区分大小写）

## 测试部署

设置好 Secrets 后：
```bash
cd prediction-web
git commit --allow-empty -m "chore: Test GitHub Actions deployment"
git push
```

然后在 GitHub Actions 页面查看运行状态：
https://github.com/dannykan/prediction-web/actions
