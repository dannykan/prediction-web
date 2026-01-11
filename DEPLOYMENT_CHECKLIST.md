# 部署檢查清單

## 📋 部署前檢查

### 1. 環境變數配置

#### 前端 (prediction-web) - Cloudflare Pages

在 Cloudflare Pages 的環境變數設置中，需要配置：

```bash
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.app
```

**設置位置**：
1. 登入 Cloudflare Dashboard
2. 進入 Pages → predictiongod 專案
3. Settings → Environment variables
4. 添加上述環境變數（Production 環境）

#### 後端 (prediction-backend) - Railway

在 Railway 的環境變數設置中，需要配置：

```bash
FRONTEND_URL=https://predictiongod.app
DATABASE_URL=<Railway PostgreSQL 連接字串>
NODE_ENV=production
PORT=5001
```

**設置位置**：
1. 登入 Railway Dashboard
2. 進入 prediction-backend 服務
3. Variables 標籤
4. 確認所有必要的環境變數都已設置

### 2. 資料庫遷移檢查

#### 確認所有 Migration 已執行

Railway 後端應該自動執行 migration，但需要確認：

1. **檢查 Migration 狀態**：
   ```bash
   # 在 Railway 的服務日誌中查看
   # 應該看到類似 "Migration executed successfully" 的訊息
   ```

2. **關鍵 Migration 文件**（按時間順序）：
   - ✅ `1767200000000-CreateMarketFollows.ts` - 市場關注功能
   - ✅ `1770000000000-AddLmsrTables.ts` - LMSR 交易系統
   - ✅ `1773000000000-CreateExclusiveMarkets.ts` - 獨家市場
   - ✅ 其他所有 migration 文件

3. **驗證資料庫結構**：
   - 確認 `market_follows` 表存在（關注功能）
   - 確認 `lmsr_positions` 表存在（LMSR 系統）
   - 確認 `exclusive_markets` 表存在（獨家市場）

### 3. API 端點檢查

#### 確認所有 API 路由正確配置

**前端 BFF 路由**（`/api/*`）：
- ✅ `/api/markets/[id]/follow` - 關注/取消關注市場
- ✅ `/api/markets/[id]/follow/status` - 檢查關注狀態
- ✅ `/api/referrals/stats` - 邀請統計
- ✅ `/api/referrals/details` - 邀請詳情
- ✅ `/api/referrals/apply` - 應用邀請碼
- ✅ 其他所有 API 路由

**後端 API**：
- ✅ `/markets/:id/follow` - 關注市場
- ✅ `/markets/:id/follow/status` - 檢查關注狀態
- ✅ `/referrals/stats` - 邀請統計
- ✅ `/referrals/details` - 邀請詳情
- ✅ `/referrals/apply` - 應用邀請碼

### 4. CORS 配置檢查

#### 後端 CORS 設置

確認 `prediction-backend` 的 CORS 配置允許：
- ✅ `https://predictiongod.app`
- ✅ `https://www.predictiongod.app`
- ✅ `https://predictiongod.pages.dev` (Cloudflare Pages 預覽)

**檢查位置**：`prediction-backend/src/main.ts` 或 CORS 配置檔案

### 5. 硬編碼 URL 檢查

#### 已檢查的檔案

✅ **前端**：
- `src/shared/utils/seo.ts` - 使用環境變數 `NEXT_PUBLIC_SITE_URL`
- `src/core/api/bffServerFetch.ts` - 使用環境變數 `NEXT_PUBLIC_API_BASE_URL`
- 所有 API 路由都使用環境變數

✅ **後端**：
- `src/referrals/referrals.service.ts` - 使用環境變數 `FRONTEND_URL`，預設值為 `https://predictiongod.app`

### 6. Cloudflare Pages 部署配置

#### Next.js 構建配置

Cloudflare Pages 需要：

1. **構建命令**：
   ```bash
   npm run build
   ```

2. **構建輸出目錄**：
   ```
   .next
   ```

3. **Node.js 版本**：
   - 建議使用 Node.js 18 或更高版本

4. **環境變數**：
   - `NEXT_PUBLIC_API_BASE_URL` - 後端 API URL
   - `NEXT_PUBLIC_SITE_URL` - 前端網站 URL

### 7. Railway 後端部署檢查

#### 確認事項

1. **資料庫連接**：
   - ✅ Railway PostgreSQL 服務已創建
   - ✅ `DATABASE_URL` 環境變數已設置
   - ✅ 資料庫連接正常

2. **Migration 執行**：
   - ✅ Railway 應該在啟動時自動執行 migration
   - ✅ 檢查日誌確認 migration 成功

3. **健康檢查**：
   - ✅ `/health` 端點正常響應
   - ✅ 資料庫連接檢查通過

### 8. 功能測試清單

部署後需要測試：

#### 前端功能
- [ ] 首頁載入正常
- [ ] 市場列表顯示正常
- [ ] 篩選器功能（熱門、最新、倒數中、已關注、已下注）
- [ ] 搜尋功能
- [ ] 市場詳情頁面
- [ ] 關注/取消關注功能
- [ ] 用戶登入/登出
- [ ] 個人資料頁面
- [ ] 邀請好友頁面
- [ ] 任務頁面
- [ ] 通知頁面
- [ ] 排行榜頁面

#### 後端 API
- [ ] `/health` - 健康檢查
- [ ] `/markets` - 市場列表
- [ ] `/markets/:id` - 市場詳情
- [ ] `/markets/:id/follow` - 關注市場
- [ ] `/markets/:id/follow/status` - 關注狀態
- [ ] `/referrals/stats` - 邀請統計
- [ ] `/referrals/details` - 邀請詳情
- [ ] `/referrals/apply` - 應用邀請碼
- [ ] `/users/:id/statistics` - 用戶統計
- [ ] `/users/:id/positions` - 用戶持倉

### 9. 資料庫架構變化注意事項

#### 新增的表

1. **market_follows** - 市場關注表
   - 用於存儲用戶關注的市場
   - Migration: `1767200000000-CreateMarketFollows.ts`

2. **lmsr_positions** - LMSR 持倉表
   - 用於存儲 LMSR 交易系統的持倉
   - Migration: `1770000000000-AddLmsrTables.ts`

3. **exclusive_markets** - 獨家市場表
   - 用於存儲獨家市場資料
   - Migration: `1773000000000-CreateExclusiveMarkets.ts`

#### 新增的欄位

檢查以下表的欄位是否正確：
- `users` 表 - 確認所有新欄位已添加
- `markets` 表 - 確認 `shortCode` 欄位存在
- `categories` 表 - 確認 `iconUrl` 欄位存在

### 10. 部署步驟

#### GitHub 上傳

1. **提交所有更改**：
   ```bash
   git add .
   git commit -m "準備部署：更新前後端配置"
   git push origin main
   ```

2. **確認分支**：
   - 前端：`prediction-web` 目錄
   - 後端：`prediction-backend` 目錄

#### Cloudflare Pages 自動部署

1. **連接 GitHub 倉庫**：
   - 在 Cloudflare Pages 中連接 GitHub 倉庫
   - 選擇 `prediction-web` 目錄作為根目錄

2. **構建設置**：
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `prediction-web`

3. **環境變數**：
   - 在 Cloudflare Pages 設置中添加環境變數

#### Railway 後端部署

1. **連接 GitHub 倉庫**：
   - 在 Railway 中連接 GitHub 倉庫
   - 選擇 `prediction-backend` 目錄

2. **自動部署**：
   - Railway 會自動檢測變更並部署
   - 確認 migration 自動執行

### 11. 部署後驗證

#### 立即檢查

1. **前端**：
   - 訪問 `https://predictiongod.app`
   - 確認頁面正常載入
   - 檢查瀏覽器控制台是否有錯誤

2. **後端**：
   - 訪問 `https://prediction-backend-production-8f6c.up.railway.app/health`
   - 確認健康檢查通過

3. **API 連接**：
   - 在前端測試 API 調用
   - 確認 CORS 配置正確

#### 監控日誌

1. **Cloudflare Pages**：
   - 檢查構建日誌
   - 確認構建成功

2. **Railway**：
   - 檢查部署日誌
   - 確認 migration 執行成功
   - 檢查應用日誌是否有錯誤

### 12. 常見問題排查

#### 問題 1: 前端無法連接後端

**解決方案**：
- 檢查 `NEXT_PUBLIC_API_BASE_URL` 是否正確設置
- 確認後端 URL 可訪問
- 檢查 CORS 配置

#### 問題 2: Migration 失敗

**解決方案**：
- 檢查 Railway 日誌
- 確認資料庫連接正常
- 手動執行 migration（如果需要）

#### 問題 3: 環境變數未生效

**解決方案**：
- 確認環境變數名稱正確（注意大小寫）
- 重新部署服務
- 清除 Cloudflare 緩存

### 13. 回滾計劃

如果部署出現問題：

1. **前端回滾**：
   - 在 Cloudflare Pages 中選擇之前的部署版本
   - 點擊 "Rollback to this deployment"

2. **後端回滾**：
   - 在 Railway 中選擇之前的部署版本
   - 或使用 Git 回滾到之前的 commit

3. **資料庫回滾**：
   - 如果有 migration 問題，使用 `npm run migration:revert`

---

## ✅ 部署確認

完成所有檢查後，確認：

- [ ] 所有環境變數已設置
- [ ] 所有 migration 已執行
- [ ] CORS 配置正確
- [ ] 無硬編碼 URL
- [ ] 功能測試通過
- [ ] 日誌無錯誤

**準備就緒後，可以開始部署！** 🚀
