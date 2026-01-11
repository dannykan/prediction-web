# 在 Railway 运行 Migration 的替代方法

由于 Railway Dashboard 中没有直接的 Shell 选项，这里提供替代方法。

---

## 方法 1：直接运行 SQL（最简单，推荐）

### 步骤：

1. **登录 Railway Dashboard**
   - 访问 https://railway.app
   - 登录你的账号

2. **找到 PostgreSQL 数据库服务**
   - 在你的项目中找到 PostgreSQL 数据库服务
   - 点击进入数据库详情页

3. **打开数据查询界面**
   - 点击 "Data" 或 "Query" 标签
   - 或者找到 "Connect" 按钮，选择 "Query" 选项

4. **运行 SQL**

复制并粘贴以下 SQL 并执行：

```sql
-- 创建 market_follows 表
CREATE TABLE IF NOT EXISTS market_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "marketId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建唯一约束（防止重复关注）
CREATE UNIQUE INDEX IF NOT EXISTS UQ_market_follows_userId_marketId 
    ON market_follows ("userId", "marketId");

-- 创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS IDX_market_follows_userId 
    ON market_follows ("userId");

CREATE INDEX IF NOT EXISTS IDX_market_follows_marketId 
    ON market_follows ("marketId");

-- 创建外键约束
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_market_follows_userId'
    ) THEN
        ALTER TABLE market_follows
            ADD CONSTRAINT FK_market_follows_userId
            FOREIGN KEY ("userId")
            REFERENCES users(id)
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_market_follows_marketId'
    ) THEN
        ALTER TABLE market_follows
            ADD CONSTRAINT FK_market_follows_marketId
            FOREIGN KEY ("marketId")
            REFERENCES markets(id)
            ON DELETE CASCADE;
    END IF;
END $$;
```

5. **标记 Migration 为已完成**

运行上面的 SQL 后，还需要在 `migrations` 表中记录这个 migration：

```sql
-- 插入 migration 记录
INSERT INTO migrations (timestamp, name) 
VALUES (1767200000000, 'CreateMarketFollows1767200000000')
ON CONFLICT DO NOTHING;
```

6. **验证表是否创建成功**

```sql
-- 检查表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'market_follows'
) AS table_exists;

-- 查看表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'market_follows'
ORDER BY ordinal_position;

-- 查看索引
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'market_follows';
```

---

## 方法 2：使用 Railway CLI（需要本地配置）

如果你想要使用命令行，需要先在本地配置 Railway CLI：

### 步骤：

1. **安装 Railway CLI**（如果还没有）
   ```bash
   npm install -g @railway/cli
   ```

2. **登录 Railway**
   ```bash
   railway login
   ```
   这会在浏览器中打开登录页面

3. **链接到项目**
   ```bash
   cd prediction-backend
   railway link
   ```
   选择你的项目和服务

4. **运行 Migration**
   ```bash
   railway run npm run migration:run
   ```

---

## 方法 3：使用外部数据库客户端

如果你有 PostgreSQL 客户端工具（如 pgAdmin、DBeaver、TablePlus 等）：

1. **获取数据库连接信息**
   - 在 Railway Dashboard 中找到 PostgreSQL 服务
   - 查看 "Variables" 标签中的 `DATABASE_URL`
   - 或者查看 "Connect" 选项中的连接字符串

2. **连接到数据库**
   - 使用连接字符串连接到数据库
   - Railway 的 `DATABASE_URL` 格式通常是：
     `postgresql://user:password@host:port/database`

3. **运行 SQL**
   - 使用方法 1 中的 SQL 语句
   - 在客户端工具中执行

---

## 推荐流程

**最简单的方法**：使用方法 1（直接在数据库查询界面运行 SQL）

1. ✅ 直接在 Railway Dashboard 的数据库查询界面运行 SQL
2. ✅ 不需要额外的工具或配置
3. ✅ 立即生效
4. ✅ 容易验证

---

## 验证 Migration 成功

运行 migration 后，执行以下 SQL 验证：

```sql
-- 1. 检查表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'market_follows'
) AS table_exists;

-- 2. 检查表结构是否正确
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'market_follows'
ORDER BY ordinal_position;

-- 3. 检查 migration 是否已记录
SELECT * FROM migrations 
WHERE name = 'CreateMarketFollows1767200000000';

-- 4. 检查索引是否创建
SELECT indexname FROM pg_indexes 
WHERE tablename = 'market_follows';
```

预期结果：
- `table_exists` = `true`
- 表有 4 列：`id`, `userId`, `marketId`, `createdAt`
- migration 记录存在
- 有 3 个索引（包括唯一约束）

---

## 故障排除

### 如果表已存在

如果运行 SQL 时提示表已存在，这是正常的（使用了 `IF NOT EXISTS`）。只需要运行标记 migration 的 SQL：

```sql
INSERT INTO migrations (timestamp, name) 
VALUES (1767200000000, 'CreateMarketFollows1767200000000')
ON CONFLICT DO NOTHING;
```

### 如果外键约束失败

确保 `users` 和 `markets` 表都存在。如果不存在，说明数据库还没有完全初始化。

### 如果权限不足

Railway 的默认数据库用户应该有所有必要的权限。如果遇到权限问题，检查数据库服务的配置。

---

完成 migration 后，关注功能的 API 就可以正常工作了！






