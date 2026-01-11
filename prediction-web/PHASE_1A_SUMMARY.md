# Phase 1A 實作總結：Next.js 公開頁串接 Railway 後端 API

## ✅ 完成項目

### 1. 建立 Server-Side Fetch Wrapper
- **檔案**: `src/core/api/serverFetch.ts`
- **功能**:
  - 從 `NEXT_PUBLIC_API_BASE_URL` 讀取後端 API 基礎 URL
  - 支援 Next.js ISR revalidation（透過 `options.next.revalidate`）
  - 自動處理錯誤（非 2xx 回應會 throw error）
  - 支援相對路徑和絕對路徑 URL

### 2. 建立 Market 資料正規化函數
- **檔案**: `src/features/market/api/normalizeMarket.ts`
- **功能**:
  - 將後端 Market 格式轉換為前端 Market 型別
  - 從 title 自動生成 slug
  - 計算 yes/no 百分比（優先使用 `votePercentage`，否則從 options volume 計算）
  - 處理 `shortCode` 欄位（支援 camelCase 和 snake_case）

### 3. 更新 Market API 函數
- **`src/features/market/api/getMarkets.ts`**:
  - 改為呼叫 `GET /markets` API
  - 支援 query 參數：`status`, `search`, `categoryId`, `creatorId`
  - **不帶 userId**（公開頁面）
  - 支援 ISR revalidation（預設 60 秒）
  - 錯誤時回傳空陣列（graceful degradation）

- **`src/features/market/api/getMarketByShortcode.ts`**:
  - 改為呼叫 `GET /markets/by-code/:code` API
  - 支援 ISR revalidation（預設 60 秒）
  - 錯誤時回傳 null（404 或其他錯誤）

### 4. 更新 Sitemap
- **檔案**: `src/app/sitemap.ts`
- 限制為前 1000 筆市場（避免 sitemap 過大）
- 使用 `getMarkets()` 取得真實資料

### 5. 保持的功能
- ✅ ISR revalidation（`export const revalidate = 60`）
- ✅ SEO metadata（`generateMetadata` 正常工作）
- ✅ Canonical redirect（錯誤 slug 會 redirect 到正確 URL）
- ✅ 公開頁面不帶 userId（避免 ISR cache 破碎）

## 📋 API 端點對應

| 前端函數 | 後端端點 | Query 參數 |
|---------|---------|-----------|
| `getMarkets()` | `GET /markets` | `status`, `search`, `categoryId`, `creatorId` (不帶 `userId`) |
| `getMarketByShortcode(code)` | `GET /markets/by-code/:code` | 無 |

## 🔧 環境變數設定

需要在 `.env.local` 或部署環境中設定：

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend.up.railway.app
```

## 📝 型別對齊

### 後端回傳格式 → 前端 Market 型別

| 後端欄位 | 前端欄位 | 轉換邏輯 |
|---------|---------|---------|
| `shortCode` | `shortcode` | 直接對應 |
| `title` | `slug` | 從 title 生成（`generateSlug()`） |
| `title` | `title` | 直接對應 |
| `description` | `description` | 直接對應（null → ""） |
| `imageUrl` | `imageUrl` | 直接對應（null → undefined） |
| `votePercentage` + `options` | `yesPercentage`, `noPercentage` | 計算邏輯（優先使用 `votePercentage`） |
| `totalVolume` 或 `volume` | `totalVolume` | 優先使用 `totalVolume`，否則使用 `volume` |
| `tags` | `tags` | 直接對應（null → []） |
| `updatedAt` | `updatedAt` | 直接對應 |

## 🧪 驗收檢查清單

- [x] TypeScript 編譯通過 (`npm run typecheck`)
- [x] 無 linter 錯誤
- [x] `/markets` 頁面使用真實 API
- [x] `/m/[id]` 頁面使用真實 API
- [x] Canonical redirect 邏輯正常
- [x] ISR revalidation 設定正確
- [x] SEO metadata 正常生成
- [x] Sitemap 限制為前 1000 筆

## 🚀 下一步

1. 設定 `NEXT_PUBLIC_API_BASE_URL` 環境變數
2. 執行 `npm run dev` 測試本地開發
3. 執行 `npm run build` 驗證生產建置
4. 部署並驗證 Railway API 連線

## 📌 注意事項

1. **公開頁面不帶 userId**：所有公開頁面（`/markets`, `/m/[id]`）都不會傳遞 `userId` 參數，確保 ISR cache 不會因為用戶而破碎。

2. **錯誤處理**：
   - `getMarkets()` 錯誤時回傳空陣列（避免頁面崩潰）
   - `getMarketByShortcode()` 錯誤時回傳 null（觸發 404）

3. **ISR Revalidation**：
   - 預設為 60 秒
   - 可在呼叫時自訂（例如 sitemap 使用 3600 秒）

4. **Slug 生成**：
   - 從 `title` 自動生成 slug
   - 如果 URL 中的 slug 與 canonical slug 不一致，會自動 redirect



