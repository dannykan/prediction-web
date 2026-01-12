# 简单部署解决方案

## 问题

即使禁用了自动部署，仍然有多个部署同时出现，导致：
- 每次推送代码都会创建多个部署
- 不同时间完成，不知道哪个是最终的
- 需要手动检查哪个部署是正常的

## 根本原因

即使禁用了自动部署，Cloudflare Pages 的 Git 集成仍然会：
1. 检测到代码推送
2. 可能创建多个部署（可能是队列中的延迟部署）
3. 有些部署可能被跳过，有些会成功

## 最终解决方案

### 选项 1：完全断开 Git 集成（推荐，最简单）

**这将完全移除 Git 集成，只使用手动部署：**

1. **访问 Cloudflare Dashboard**
   - 网址：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings/configuration

2. **断开 Git 集成**
   - 找到 **"Source"** 或 **"Git integration"** 部分
   - 点击 **"Disconnect"** 或 **"Remove Git integration"**
   - 确认断开

3. **使用手动上传部署**
   - 以后使用 Wrangler CLI 手动部署
   - 或者使用 Cloudflare Dashboard 的 "Upload assets" 功能

### 选项 2：保持 Git 集成但完全禁用自动部署（当前状态）

**当前配置：**
- ✅ Production 自动部署：已禁用
- ✅ Preview 自动部署：已禁用
- ✅ 所有自动部署：已禁用

**但可能仍有延迟的部署在队列中**

**等待当前部署完成：**
- 等待所有正在进行的部署完成（可能需要几分钟）
- 之后应该不会有新的自动部署

## 推荐方案：使用 Wrangler CLI 手动部署

这是最简单、最可控的方式：

### 1. 安装 Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. 部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash
cd prediction-web
npm run build:cloudflare
wrangler pages deploy .open-next \
  --project-name=predictiongod \
  --branch=main \
  --commit-dirty=true
```

### 3. 使用方式

```bash
# 每次需要部署时
./deploy.sh
```

**优势：**
- ✅ 完全控制 - 只有你运行脚本时才部署
- ✅ 单一部署 - 每次只有一个部署
- ✅ 简单明了 - 不需要检查多个部署
- ✅ 可靠 - 使用与 `dedde1ea` 相同的方式

## 当前正常工作的部署

- ✅ `c04ebc5d` - 正常工作，已设置为 Production
- ✅ `dedde1ea` - 正常工作（原始版本）

## 立即操作

### 1. 将 `c04ebc5d` 提升为 Production（如果还没设置）

访问：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/deployments

找到 `c04ebc5d`，点击 `...` 菜单，选择 **"Promote to production"**。

### 2. 等待当前部署完成

等待所有正在进行的部署完成（可能需要几分钟）。之后应该不会有新的自动部署。

### 3. 配置环境变量

在 Cloudflare Dashboard 中添加环境变量：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 未来部署

### 推荐：使用 Wrangler CLI

```bash
cd prediction-web
npm run build:cloudflare
wrangler pages deploy .open-next --project-name=predictiongod
```

这样：
- ✅ 每次只有一个部署
- ✅ 完全控制部署时机
- ✅ 不需要检查多个部署
- ✅ 简单明了

## 如果仍然有多个部署

如果等待后仍然有多个部署出现，建议：

1. **完全断开 Git 集成**
   - 在 Cloudflare Dashboard 中移除 Git 连接
   - 只使用 Wrangler CLI 手动部署

2. **或者接受现状**
   - 等待所有部署完成
   - 只关注正常工作的部署（例如：`c04ebc5d`）
   - 忽略其他部署

## 总结

**最简单的方案：**
1. 使用 Wrangler CLI 手动部署
2. 每次只有一个部署
3. 完全控制，简单明了

**当前状态：**
- `c04ebc5d` 正常工作，已设置为 Production
- 自动部署已禁用
- 等待当前部署队列完成
