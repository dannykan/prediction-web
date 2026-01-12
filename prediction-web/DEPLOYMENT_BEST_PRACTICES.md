# 🎯 部署最佳实践

## 为什么部署会一直不顺利？

### 根本原因

1. **Submodule 历史遗留** - Git 历史中包含了 submodule 引用，即使当前已移除
2. **配置不一致** - 多个地方需要配置（Git、Cloudflare、构建脚本）
3. **部署方式混乱** - 混用了多种部署方式（Wrangler CLI、Git 集成）

## ✅ 正确的部署流程

### 1. 只使用 Git 推送部署

**✅ 正确方式**：
```bash
cd prediction-web
git add .
git commit -m "your changes"
git push
```

**❌ 不要使用**：
- `./deploy.sh` (Wrangler CLI - 会创建 `ad_hoc` 类型部署，会失败)
- Cloudflare Dashboard 手动上传
- 在根目录提交（会包含其他项目）

### 2. 保持仓库独立

**项目结构**：
```
Prediction-God/                    (不要在这里提交)
├── prediction-app/                (独立 Git 仓库)
├── prediction-backend/            (独立 Git 仓库)
└── prediction-web/                 (独立 Git 仓库 - 只提交这里)
```

**规则**：
- ✅ 只在各自的仓库目录中提交
- ✅ 使用 `.gitignore` 忽略其他项目
- ❌ 不要在根目录提交
- ❌ 不要将其他项目添加为 submodule

### 3. 配置检查清单

部署前确认：

- [ ] **Git 自动部署已启用**
  - 在 Cloudflare Dashboard 中检查
  - 或通过 API 确认 `deployments_enabled: true`

- [ ] **构建配置正确**
  - 构建命令: `npm run build:cloudflare`
  - 输出目录: `.open-next`
  - 根目录: `prediction-web`

- [ ] **没有 Submodule 引用**
  ```bash
  git ls-files | grep prediction-app
  # 应该没有输出
  ```

- [ ] **环境变量已设置**
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 4. 监控部署

**查看部署状态**：
- Cloudflare Dashboard: https://dash.cloudflare.com/.../pages/predictiongod/deployments
- 检查部署类型应该是 `github:push`（不是 `ad_hoc`）
- 查看构建日志找出错误

## 🔧 如果部署失败

### 步骤 1: 查看构建日志

在 Cloudflare Dashboard 中：
1. 点击失败的部署
2. 查看 "Build Logs"
3. 找出具体的错误信息

### 步骤 2: 常见问题

**Submodule 错误**：
```bash
# 检查并清理
git ls-files | grep prediction-app
git rm --cached prediction-app  # 如果存在
```

**构建失败**：
- 检查环境变量
- 检查 Node.js 版本
- 检查依赖安装

**部署类型错误**：
- 确保使用 Git 推送（不是 Wrangler CLI）
- 确保 Git 自动部署已启用

### 步骤 3: 重新部署

修复问题后：
```bash
cd prediction-web
git commit --allow-empty -m "chore: Retry deployment after fix"
git push
```

## 📋 日常检查清单

每次部署前：

1. ✅ 确认在 `prediction-web` 目录
2. ✅ 确认没有 submodule 引用
3. ✅ 确认代码已提交
4. ✅ 推送到 GitHub
5. ✅ 等待 2-5 分钟
6. ✅ 检查 Cloudflare Dashboard 中的部署状态

## 🎯 长期目标

1. **自动化** - 所有部署通过 Git 推送自动触发
2. **可靠性** - 每次部署都能成功
3. **可追踪** - 所有部署都有清晰的日志
4. **简单** - 不需要手动操作

## 当前状态

- ✅ Git 自动部署已启用
- ✅ Submodule 引用已清理
- ✅ 构建配置已更新
- ✅ `.gitignore` 已添加
- ✅ 预防措施已到位

**现在只需要：**
```bash
cd prediction-web
git add .
git commit -m "your changes"
git push
```

部署应该会自动成功！🎉
