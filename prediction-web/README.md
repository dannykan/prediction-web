# Prediction God Web (Phase 0)

Next.js App Router + TypeScript 專案，實作兩個公開 SEO 頁面（ISR）。

## 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

### 建置

```bash
npm run build
```

### 其他指令

```bash
npm run lint      # Biome lint
npm run format    # Biome format
npm run typecheck # TypeScript 類型檢查
```

## 測試頁面

### 市場列表
- URL: http://localhost:3000/markets
- 功能：顯示所有市場列表（ISR，60 秒重新驗證）

### 市場詳情
- URL: http://localhost:3000/m/AB12cd-will-trump-win-2024
- 功能：顯示市場詳情（ISR，60 秒重新驗證）
- Redirect 測試：訪問 http://localhost:3000/m/AB12cd-wrong-slug 會自動 redirect 到正確的 canonical URL

### SEO 頁面
- Sitemap: http://localhost:3000/sitemap.xml
- Robots: http://localhost:3000/robots.txt

## 驗證 SEO

1. **View Page Source**：在瀏覽器中右鍵 → 查看網頁原始碼，應該能看到完整的 HTML 內容（不是空白殼）
2. **Metadata**：檢查 `<head>` 中的 title、description、canonical、OG tags
3. **Redirect**：訪問錯誤的 slug 應該會自動 redirect 到正確的 canonical URL

## Phase 1 建議修改

當要串接真實 API 時，建議修改以下檔案：

1. **`src/features/market/api/getMarkets.ts`**
   - 將 mock data 改為真實 API 呼叫
   - 使用 `src/core/api/client.ts` 的 `apiClient`
   - 使用 `src/core/api/endpoints.ts` 的 endpoints

2. **`src/features/market/api/getMarketByShortcode.ts`**
   - 將 mock 查詢改為真實 API 呼叫
   - 使用 `endpoints.marketByShortcode(shortcode)`

3. **`src/core/api/client.ts`**
   - 更新 `prefixUrl` 為真實的 API base URL
   - 可能需要加入認證 headers

4. **`src/core/api/endpoints.ts`**
   - 確認 endpoints 路徑與後端 API 一致

5. **`.env.local`**
   - 更新 `NEXT_PUBLIC_API_BASE_URL` 為真實的 API URL

## 專案結構

```
src/
├── app/
│   ├── (public)/          # 公開頁面路由群組
│   │   ├── layout.tsx     # 公開頁面 layout（含 Navbar）
│   │   ├── page.tsx       # Landing 頁面
│   │   ├── markets/       # 市場列表
│   │   └── m/[id]/        # 市場詳情（動態路由）
│   ├── layout.tsx         # Root layout
│   ├── sitemap.ts         # 動態 sitemap
│   ├── robots.ts          # robots.txt
│   ├── not-found.tsx      # 404 頁面
│   └── error.tsx          # Error 頁面
├── features/
│   └── market/
│       ├── types/         # Market 類型定義
│       ├── api/           # API 函數（目前為 mock）
│       └── components/    # Market 相關組件
├── shared/
│   ├── components/        # 共用組件
│   └── utils/            # 工具函數
└── core/
    └── api/              # API client 設定
```
