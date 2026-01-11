# Phase 0 完成總結

## ✅ 已完成項目

### 1. 專案設定
- ✅ Next.js 16.1.1 (App Router + TypeScript + Tailwind)
- ✅ Import alias: `@/*` → `./src/*`
- ✅ shadcn/ui: button, card, skeleton
- ✅ Biome (lint/format) + TypeScript typecheck
- ✅ ky (API client)

### 2. 環境變數
- ✅ `.env.local` 已建立
- ✅ `NEXT_PUBLIC_SITE_URL` 和 `NEXT_PUBLIC_API_BASE_URL`
- ✅ SEO 工具函數 (`src/shared/utils/seo.ts`)

### 3. 檔案結構
所有檔案已按照要求建立：
```
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── markets/page.tsx
│   │   └── m/[id]/page.tsx
│   ├── layout.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   └── error.tsx
├── features/market/
│   ├── types/market.ts
│   ├── api/
│   │   ├── getMarkets.ts
│   │   ├── getMarketByShortcode.ts
│   │   └── parseMarketId.ts
│   └── components/
│       ├── MarketCard.tsx
│       ├── MarketsList.tsx
│       ├── MarketDetailView.tsx
│       └── MarketDetailSkeleton.tsx
├── shared/
│   ├── components/layouts/Navbar.tsx
│   └── utils/
│       ├── seo.ts
│       └── format.ts
└── core/api/
    ├── client.ts
    └── endpoints.ts
```

### 4. Mock Data
- ✅ 3 筆 mock markets（包含所有必要欄位）
- ✅ `getMarkets()` 和 `getMarketByShortcode()` 函數

### 5. 路由與 SEO

#### `/markets` 頁面
- ✅ ISR: `export const revalidate = 60`
- ✅ Server Component（無 'use client'）
- ✅ 完整 SEO metadata（title, description, OG, Twitter）
- ✅ 使用 `absUrl()` 生成絕對 URL

#### `/m/[id]` 頁面
- ✅ ISR: `export const revalidate = 60`
- ✅ Server Component（無 'use client'）
- ✅ ID 解析：以 shortcode 為主，slug 僅為語意
- ✅ Redirect 邏輯：slug 不一致時自動 redirect 到 canonical URL
- ✅ `generateMetadata()` 動態生成 SEO
- ✅ Canonical URL 設定
- ✅ 完整 OG + Twitter cards

#### ID 解析邏輯
```typescript
// id = "AB12cd-will-trump-win-2024"
// shortcode = "AB12cd"
// slugFromUrl = "will-trump-win-2024"
// 若 slugFromUrl !== market.slug → redirect
```

### 6. Sitemap 與 Robots
- ✅ `sitemap.ts`：動態生成，包含所有 markets
- ✅ `robots.ts`：正確設定 allow/disallow
- ✅ 所有 URL 使用 `absUrl()`（不 hardcode 網域）

### 7. UI 組件
- ✅ Navbar（含導航連結）
- ✅ MarketCard（市場卡片）
- ✅ MarketsList（市場列表）
- ✅ MarketDetailView（市場詳情）
- ✅ MarketDetailSkeleton（載入骨架）

## 🧪 測試驗證

### 啟動專案
```bash
cd prediction-web
npm install
npm run dev
```

### 測試網址

1. **Landing 頁面**
   - http://localhost:3000/

2. **市場列表**
   - http://localhost:3000/markets
   - ✅ 應顯示 3 個市場卡片
   - ✅ View Page Source 應有完整 HTML

3. **市場詳情（正確）**
   - http://localhost:3000/m/AB12cd-will-trump-win-2024
   - ✅ 應正常顯示市場內容
   - ✅ View Page Source 應有完整 HTML

4. **Redirect 測試（重要）**
   - http://localhost:3000/m/AB12cd-wrong-slug
   - ✅ 應自動 redirect 到 `/m/AB12cd-will-trump-win-2024`
   - ✅ 檢查 Network tab 應看到 307/308 redirect

5. **SEO 頁面**
   - http://localhost:3000/sitemap.xml
   - http://localhost:3000/robots.txt
   - ✅ 應可正常訪問

### 驗收條件檢查

- ✅ `npm run dev` 可啟動
- ✅ `/markets` 可正常顯示
- ✅ `/m/AB12cd-will-trump-win-2024` 可正常顯示
- ✅ 點 MarketCard 會導到正確 URL
- ✅ 錯誤 slug 會 redirect 到 canonical URL
- ✅ View Page Source 可看到完整內容（不是空白殼）
- ✅ `/sitemap.xml` 與 `/robots.txt` 可訪問
- ✅ `npm run build` 可通過
- ✅ `npm run typecheck` 無錯誤
- ✅ Console 無 error

## 📝 Phase 1 建議修改

當要串接真實 API 時，建議按以下順序修改：

### 1. 更新環境變數
**檔案**: `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=https://your-real-api.com
```

### 2. 更新 API Client
**檔案**: `src/core/api/client.ts`
- 更新 `prefixUrl` 為真實 API URL
- 可能需要加入認證 headers（如 `Authorization`）

### 3. 更新 Endpoints
**檔案**: `src/core/api/endpoints.ts`
- 確認 endpoints 路徑與後端 API 一致
- 例如：`/api/v1/markets` 或 `/markets`

### 4. 替換 Mock Data
**檔案**: `src/features/market/api/getMarkets.ts`
```typescript
// 從
return MOCK_MARKETS;

// 改為
const response = await apiClient.get(endpoints.markets).json();
return response.data; // 或根據實際 API 結構調整
```

**檔案**: `src/features/market/api/getMarketByShortcode.ts`
```typescript
// 從
const markets = await getMarkets();
return markets.find(...);

// 改為
const response = await apiClient
  .get(endpoints.marketByShortcode(shortcode))
  .json();
return response.data; // 或根據實際 API 結構調整
```

### 5. 處理錯誤
- 在 API 函數中加入 try-catch
- 處理 404 等錯誤狀態
- 可能需要加入 loading states（雖然 ISR 會 cache）

### 6. 類型定義
**檔案**: `src/features/market/types/market.ts`
- 確認 Market 類型與後端 API 回應一致
- 可能需要加入額外欄位或調整欄位名稱

## 🎯 重點提醒

1. **Server Components**：所有公開頁面都是 Server Components，確保 SEO
2. **ISR**：使用 `revalidate = 60` 實現增量靜態再生
3. **Canonical URL**：slug 不一致時自動 redirect，避免重複內容
4. **絕對 URL**：所有 SEO URL 使用 `absUrl()`，不 hardcode 網域
5. **View Page Source**：確保可直接看到完整 HTML 內容



