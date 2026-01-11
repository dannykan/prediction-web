# 在 Railway 运行 Migration 指南

由于 Railway CLI 需要交互式登录，这里提供两种方法来运行 migration。

---

## 方法 1：使用 Railway Dashboard Shell（推荐）

### 步骤：

1. **登录 Railway Dashboard**
   - 访问 https://railway.app
   - 登录你的账号

2. **选择后端服务**
   - 在 Dashboard 中找到你的后端服务（prediction-backend）
   - 点击进入服务详情页

3. **打开 Shell**
   - 点击 "Deployments" 标签
   - 选择最新的部署
   - 点击 "View Logs" 旁边的下拉菜单
   - 选择 "Open Shell" 或 "Shell"

4. **运行 Migration**
   在 Shell 中执行：
   ```bash
   npm run migration:run
   ```

5. **验证 Migration 是否成功**
   ```bash
   # 检查 migration 是否已运行
   npm run migration:show
   
   # 或者检查表是否存在（需要在数据库查询界面执行）
   ```

---

## 方法 2：直接在数据库中运行 SQL（如果方法 1 失败）

### 步骤：

1. **登录 Railway Dashboard**
   - 访问 https://railway.app
   - 登录你的账号

2. **找到 PostgreSQL 数据库服务**
   - 在项目中找到 PostgreSQL 数据库服务
   - 点击进入详情页

3. **打开查询界面**
   - 点击 "Query" 或 "Connect" 按钮
   - 或者使用 "Data" 标签下的查询界面

4. **运行 SQL**
   复制并执行以下 SQL（或者运行 `migrations/CreateMarketFollows.sql` 文件）：

```sql
-- Create market_follows table
CREATE TABLE IF NOT EXISTS market_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "marketId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to prevent duplicate follows
CREATE UNIQUE INDEX IF NOT EXISTS UQ_market_follows_userId_marketId 
    ON market_follows ("userId", "marketId");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS IDX_market_follows_userId 
    ON market_follows ("userId");

CREATE INDEX IF NOT EXISTS IDX_market_follows_marketId 
    ON market_follows ("marketId");

-- Create foreign keys
ALTER TABLE market_follows
    ADD CONSTRAINT FK_market_follows_userId
    FOREIGN KEY ("userId")
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE market_follows
    ADD CONSTRAINT FK_market_follows_marketId
    FOREIGN KEY ("marketId")
    REFERENCES markets(id)
    ON DELETE CASCADE;
```

5. **手动标记 Migration 为已完成**

运行 migration SQL 后，还需要在 `migrations` 表中标记这个 migration 已完成：

```sql
-- 检查 migrations 表
SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 5;

-- 插入 migration 记录
INSERT INTO migrations (timestamp, name) 
VALUES (1767200000000, 'CreateMarketFollows1767200000000')
ON CONFLICT DO NOTHING;

-- 验证
SELECT * FROM migrations WHERE name = 'CreateMarketFollows1767200000000';
```

---

## 验证 Migration 是否成功

### 检查表是否存在

```sql
-- 检查表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'market_follows'
);

-- 检查表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'market_follows'
ORDER BY ordinal_position;
```

### 预期结果

应该看到以下列：
- `id` (uuid)
- `userId` (uuid)
- `marketId` (uuid)
- `createdAt` (timestamp)

---

## 如果遇到错误

### 错误：表已存在

如果表已经存在，可以跳过创建步骤，只运行标记 migration 的 SQL。

### 错误：外键约束失败

确保 `users` 和 `markets` 表都存在。如果不存在，先运行其他必要的 migrations。

### 错误：权限不足

确保使用的数据库用户有创建表和索引的权限。Railway 的默认用户应该有这些权限。

---

## 推荐流程

1. **先尝试方法 1**（使用 Shell 运行 `npm run migration:run`）
2. **如果方法 1 失败**，使用方法 2（直接运行 SQL）
3. **验证** migration 是否成功
4. **测试** API 端点是否正常工作

---

**注意**：Migration 只需要运行一次。如果表已经存在，再次运行会跳过创建步骤（如果使用 `IF NOT EXISTS`）。






