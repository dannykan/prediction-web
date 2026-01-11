# 在 Railway 运行 Migration - 简单步骤

由于 Railway Dashboard 没有 Shell 选项，**最简单的方法是在数据库查询界面直接运行 SQL**。

---

## 🚀 快速步骤（5 分钟）

### 1. 打开数据库查询界面

1. 登录 https://railway.app
2. 在你的项目中找到 **PostgreSQL 数据库服务**
3. 点击进入数据库详情页
4. 点击 **"Data"** 或 **"Query"** 标签
   - 如果看到 "Connect" 按钮，点击它，然后选择 "Query"

### 2. 运行 SQL

复制并粘贴以下完整 SQL（包括标记 migration 的部分），然后点击执行：

```sql
-- ============================================
-- 创建 market_follows 表
-- ============================================

-- 创建表
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

-- ============================================
-- 标记 Migration 为已完成
-- ============================================
INSERT INTO migrations (timestamp, name) 
VALUES (1767200000000, 'CreateMarketFollows1767200000000')
ON CONFLICT DO NOTHING;

-- ============================================
-- 验证（可选）
-- ============================================
SELECT 'Migration completed successfully!' AS status;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'market_follows'
) AS table_exists;
```

### 3. 验证结果

执行后，你应该看到：
- `status`: `Migration completed successfully!`
- `table_exists`: `true`

---

## ✅ 完成！

Migration 运行成功后，关注功能的 API 就可以正常工作了！

现在你可以：
1. 测试关注按钮（在 market detail 页面）
2. 测试「已關注」筛选（在首页）
3. 验证关注状态会持久化（刷新页面后保持）

---

## 🆘 如果遇到问题

### 错误：表已存在
- **正常现象**，说明 migration 已经运行过
- 只需确保运行了标记 migration 的 SQL（最后一部分）

### 错误：外键约束失败
- 确保 `users` 和 `markets` 表都存在
- 如果不存在，说明数据库还没有完全初始化

### 找不到数据库查询界面
- 尝试点击数据库服务 → "Variables" → 查看 "DATABASE_URL"
- 或者点击 "Settings" → "Connect" 查看连接选项

---

**提示**：这个 SQL 使用了 `IF NOT EXISTS`，所以可以安全地多次运行，不会出错。






