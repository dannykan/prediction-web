# 市场关注功能部署指南

## ✅ 已完成的步骤

### 后端部署
- ✅ 提交并推送后端代码到 GitHub
- ✅ Railway 将自动检测更改并开始部署
- ✅ 新的 API 端点已实现：
  - `POST /markets/:id/follow?userId=:userId` - 关注市场
  - `DELETE /markets/:id/follow?userId=:userId` - 取消关注
  - `GET /markets/:id/follow/status?userId=:userId` - 检查关注状态
  - `GET /users/:userId/markets/followed` - 获取用户关注的 markets 列表

### 前端部署
- ✅ 提交并推送前端代码到 GitHub
- ⏳ Cloudflare Pages 将自动部署（如果已配置自动部署）

---

## ⚠️ 重要：需要手动运行的步骤

### 1. 在 Railway 运行 Migration

部署完成后，需要在 Railway 上运行 migration 来创建 `market_follows` 表。

**方法 1：使用 Railway CLI（推荐）**

```bash
# 连接到 Railway 数据库
railway shell

# 运行 migration
npm run migration:run
```

**方法 2：使用 Railway Dashboard**

1. 登录 [Railway Dashboard](https://railway.app)
2. 选择你的后端服务
3. 点击 "Deployments" → 选择最新的部署
4. 点击 "View Logs" 或 "Open Shell"
5. 在 Shell 中运行：
   ```bash
   npm run migration:run
   ```

**方法 3：使用 PostgreSQL 连接工具**

如果你有 PostgreSQL 客户端（如 pgAdmin、DBeaver），可以直接连接到 Railway 数据库并运行 migration SQL：

```sql
-- 查看 migration 文件中的 SQL
-- src/migrations/1767200000000-CreateMarketFollows.ts
```

### 2. 验证 Migration 是否成功

运行以下命令检查表是否创建成功：

```sql
-- 检查 market_follows 表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'market_follows'
);

-- 检查表结构
\d market_follows

-- 或者使用 SQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'market_follows';
```

---

## 📋 部署检查清单

### 后端
- [ ] Railway 部署完成（查看 Railway Dashboard）
- [ ] 运行 migration 创建 `market_follows` 表
- [ ] 验证 API 端点可访问：
  - `GET /health` - 健康检查
  - `GET /markets/:id/follow/status?userId=:userId` - 测试关注状态 API

### 前端
- [ ] Cloudflare Pages 部署完成（如果已配置自动部署）
- [ ] 或者手动部署：运行 `./deploy.sh`

---

## 🧪 测试步骤

### 1. 测试关注功能

1. 打开应用并登录
2. 进入任意市场详情页
3. 点击右上角的关注按钮（bookmark 图标）
4. 检查按钮是否亮起（青色）
5. 刷新页面，按钮应该保持亮起状态
6. 再次点击按钮，应该取消关注（按钮变暗）

### 2. 测试关注列表

1. 关注几个市场
2. 返回首页
3. 点击「已關注」筛选选项
4. 应该只显示已关注的市场

### 3. 测试 API（可选）

```bash
# 设置变量
USER_ID="your-user-id"
MARKET_ID="your-market-id"
API_URL="https://prediction-backend-production-8f6c.up.railway.app"

# 关注市场
curl -X POST "$API_URL/markets/$MARKET_ID/follow?userId=$USER_ID"

# 检查关注状态
curl "$API_URL/markets/$MARKET_ID/follow/status?userId=$USER_ID"

# 获取关注的 markets 列表
curl "$API_URL/users/$USER_ID/markets/followed"

# 取消关注
curl -X DELETE "$API_URL/markets/$MARKET_ID/follow?userId=$USER_ID"
```

---

## 🆘 故障排除

### Migration 失败

如果 migration 失败，检查：
1. 数据库连接是否正常
2. 是否有足够的权限
3. 表是否已存在（可能之前已经运行过）

### API 返回 404

如果 API 返回 404：
1. 确认后端部署已完成
2. 检查 API 端点路径是否正确
3. 查看 Railway 日志确认路由是否注册

### 前端功能不工作

如果前端功能不工作：
1. 检查浏览器控制台是否有错误
2. 确认后端 API 端点可访问
3. 检查网络请求是否成功
4. 确认 migration 已运行（表已创建）

---

## 📞 获取帮助

如果遇到问题：
1. 查看 Railway Dashboard 的部署日志
2. 查看 Cloudflare Pages 的构建日志
3. 检查浏览器控制台的错误信息
4. 参考代码中的调试日志（以 `🔍` 开头的日志）

---

**最后更新**: 2025-01-XX  
**状态**: ✅ 代码已部署 | ⏳ Migration 待运行






