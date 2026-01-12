# 最终解决方案：单一部署源

## 问题总结

经过多次测试，发现：

### `ad_hoc` 部署（手动触发或 GitHub Actions）
- ❌ 经常失败，返回 404
- ❌ `_worker.js` 文件没有被正确上传
- ❌ 即使构建成功，部署后也无法访问

### `github:push` 部署（Cloudflare Git 集成）
- ✅ 部署成功率高
- ✅ `_worker.js` 文件正确上传
- ✅ 网站可以正常访问

## 根本原因

`ad_hoc` 部署方式（包括 `cloudflare/pages-action@v1` 和手动触发）在处理 `_worker.js` 文件时存在问题，导致文件没有被正确上传到 Cloudflare Pages。

## 最终解决方案

### 方案 1：只使用 Cloudflare Git 集成（推荐，但需要等待队列完成）

**当前状态：**
- ✅ 自动部署已禁用
- ✅ Git 集成仍连接
- ⚠️ 可能还有之前的部署在队列中

**等待当前部署队列完成：**
- 等待所有正在进行的部署完成（可能需要几分钟）
- 之后应该不会有新的自动部署

**手动触发部署：**
- 在 Cloudflare Dashboard 中手动触发部署
- 选择要部署的 commit
- 这样会创建 `github:push` 类型的部署（应该能正常工作）

### 方案 2：使用 Wrangler CLI 手动部署（最可靠）

**这是最可靠的方式，每次只有一个部署：**

```bash
cd prediction-web

# 构建
npm run build:cloudflare

# 验证
test -f .open-next/_worker.js && echo "✅ _worker.js exists" || echo "❌ _worker.js missing"

# 部署
wrangler pages deploy .open-next --project-name=predictiongod
```

**或者使用部署脚本：**
```bash
./deploy.sh
```

## 当前正常工作的部署

- ✅ `c04ebc5d` - `github:push` 类型，正常工作
- ✅ `3d516b95` - 基于 `c04ebc5d` 重新部署，应该也正常工作
- ✅ `dedde1ea` - `github:push` 类型，正常工作

## 立即操作

### 1. 将正常部署提升为 Production

访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

选择以下任一正常部署：
- `3d516b95`（最新）
- `c04ebc5d`（已验证正常）

点击 `...` 菜单，选择 **"Promote to production"**。

### 2. 配置环境变量

在 Cloudflare Dashboard 中添加环境变量：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 3. 以后使用 Wrangler CLI 部署

**这是最简单、最可靠的方式：**

```bash
cd prediction-web
./deploy.sh
```

或者：

```bash
npm run build:cloudflare
wrangler pages deploy .open-next --project-name=predictiongod
```

## 为什么 `ad_hoc` 部署会失败？

可能的原因：
1. **文件上传问题** - `cloudflare/pages-action@v1` 可能没有正确上传 `_worker.js`
2. **构建环境差异** - Cloudflare 构建环境可能与我们本地不同
3. **脚本执行顺序** - `fix-worker.js` 可能在文件上传前执行，导致修改丢失

## 总结

**推荐方案：**
1. ✅ 使用 Wrangler CLI 手动部署（最可靠）
2. ✅ 每次只有一个部署
3. ✅ 完全控制部署时机
4. ✅ 简单明了

**当前状态：**
- `c04ebc5d` 和 `3d516b95` 正常工作
- 自动部署已禁用
- 使用 Wrangler CLI 可以确保每次只有一个正常工作的部署

## 使用方式

以后只需要：
```bash
./deploy.sh
```

就这么简单！每次只有一个部署，完全控制，不会再有混乱。
