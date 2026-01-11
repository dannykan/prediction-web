# 功能骨架实现总结

## 新增/修改文件清單

### A) BFF Route Handlers (Next.js API Routes)

1. **`src/app/api/markets/route.ts`** (新增)
   - GET /api/markets
   - 轉發到後端 GET /markets，保留所有 query parameters

2. **`src/app/api/markets/by-code/[code]/route.ts`** (新增)
   - GET /api/markets/by-code/[code]
   - 轉發到後端 GET /markets/by-code/:code

3. **`src/app/api/users/[id]/route.ts`** (新增)
   - GET /api/users/[id]
   - 轉發到後端 GET /users/:id

4. **`src/app/api/users/leaderboard/my-rank/route.ts`** (新增)
   - GET /api/users/leaderboard/my-rank
   - 從 cookie 取得 token，帶 Bearer 轉發到後端

5. **`src/app/api/me/route.ts`** (已存在，無需修改)
   - GET /api/me
   - 從 cookie 取得 token，帶 Bearer 轉發到後端

### B) 前端 API Functions

#### Market API
1. **`src/features/market/api/getMarkets.ts`** (修改)
   - 改為使用 BFF `/api/markets` 而非直接呼叫後端

2. **`src/features/market/api/getMarketByShortcode.ts`** (修改)
   - 改為使用 BFF `/api/markets/by-code/[code]` 而非直接呼叫後端

3. **`src/features/market/api/getMarketByCode.ts`** (新增)
   - getMarketByShortcode 的別名

4. **`src/features/market/api/normalizeMarket.ts`** (修改)
   - 新增 id, code, createdAt, creatorId 欄位映射

#### User API
5. **`src/features/user/api/getMe.ts`** (新增)
   - Client Component 版本，呼叫 BFF `/api/me`

6. **`src/features/user/api/getMeServer.ts`** (新增)
   - Server Component 版本，直接呼叫後端 `/me`

7. **`src/features/user/api/getUserById.ts`** (新增)
   - Server Component 版本，直接呼叫後端 `/users/:id`

### C) Types

1. **`src/features/market/types/market.ts`** (修改)
   - 新增: `id`, `code`, `createdAt`, `creatorId`

2. **`src/features/user/types/user.ts`** (新增)
   - User interface: id, username, displayName, avatarUrl, coinBalance, email, verified, createdAt, updatedAt

### D) 頁面 Skeleton

#### Public Pages (Server Components)
1. **`src/app/(public)/page.tsx`** (修改)
   - 顯示站名 + 最新 markets 前 10 筆
   - 使用 getMarkets({ status: "OPEN" })

2. **`src/app/(public)/markets/page.tsx`** (修改)
   - 簡化為簡單列表顯示 markets (title/code/updatedAt)
   - 移除 MarketsPageClient，直接使用 Server Component

3. **`src/app/(public)/m/[id]/page.tsx`** (修改)
   - 解析 params.id = "{code}-{slug}"，取 code
   - 呼叫 getMarketByShortcode(code)
   - 顯示 title/description/image/creator/createdAt/updatedAt
   - 若 slug 不正確：redirect 到 canonical URL

4. **`src/app/(public)/leaderboard/page.tsx`** (新增)
   - Placeholder 頁面

5. **`src/app/(public)/tag/[tag]/page.tsx`** (新增)
   - 顯示標籤相關的 markets

#### Authenticated Pages (Client Components)
6. **`src/app/(authenticated)/wallet/page.tsx`** (修改)
   - 呼叫 getMe() 拿 user
   - 顯示 user.displayName/user.coinBalance

7. **`src/app/(authenticated)/profile/page.tsx`** (新增)
   - 呼叫 getMe() 拿 user
   - 顯示 username/email/avatar

8. **`src/app/(authenticated)/daily-bonus/page.tsx`** (新增)
   - Placeholder 頁面

9. **`src/app/(authenticated)/referrals/page.tsx`** (新增)
   - Placeholder 頁面

## 本地驗收指令與網址

### 1. 啟動開發伺服器

```bash
cd prediction-web
npm run dev
```

預設會在 `http://localhost:3000` 啟動（或根據設定在 3001）

### 2. 驗證公開頁面 (Server Components, SEO)

#### 首頁
- **URL**: `http://localhost:3000/`
- **驗證**:
  - 顯示「神預測 Prediction God」標題
  - 顯示最新 10 個市場列表
  - 每個市場顯示 title, description, code, updatedAt
  - 可點擊連結到市場詳情頁
  - **View Source**: 應能看到完整的 HTML 內容（Server Rendered）

#### 市場列表頁
- **URL**: `http://localhost:3000/markets`
- **驗證**:
  - 顯示所有開放市場列表
  - 每個市場顯示 title, description, code, createdAt, updatedAt
  - **View Source**: 應能看到完整的 HTML 內容

#### 市場詳情頁
- **URL**: `http://localhost:3000/m/{code}-{slug}`
  - 例如: `http://localhost:3000/m/ABC123-test-market`
- **驗證**:
  - 顯示市場標題、描述、圖片
  - 顯示創建者、建立時間、更新時間
  - 若 slug 不正確，應自動 redirect 到正確的 canonical URL
  - **View Source**: 應能看到完整的 HTML 內容

#### 標籤頁
- **URL**: `http://localhost:3000/tag/{tag}`
  - 例如: `http://localhost:3000/tag/政治`
- **驗證**:
  - 顯示該標籤的所有市場
  - **View Source**: 應能看到完整的 HTML 內容

#### 排行榜頁
- **URL**: `http://localhost:3000/leaderboard`
- **驗證**:
  - 顯示 placeholder 內容
  - **View Source**: 應能看到完整的 HTML 內容

### 3. 驗證認證頁面 (Client Components)

#### 錢包頁
- **URL**: `http://localhost:3000/wallet`
- **驗證**:
  - 需要先登入（未登入會 redirect 到 /login）
  - 登入後顯示 user.displayName 和 user.coinBalance
  - 應為 Client Component（檢查 Network tab，應有對 /api/me 的請求）

#### 個人資料頁
- **URL**: `http://localhost:3000/profile`
- **驗證**:
  - 需要先登入（未登入會 redirect 到 /login）
  - 登入後顯示 username, email, avatar
  - 應為 Client Component

#### 每日獎勵頁
- **URL**: `http://localhost:3000/daily-bonus`
- **驗證**:
  - 顯示 placeholder 內容

#### 推薦好友頁
- **URL**: `http://localhost:3000/referrals`
- **驗證**:
  - 顯示 placeholder 內容

### 4. 驗證 API Routes (BFF)

#### GET /api/markets
```bash
curl http://localhost:3000/api/markets?status=OPEN
```
- 應返回市場列表 JSON

#### GET /api/markets/by-code/[code]
```bash
curl http://localhost:3000/api/markets/by-code/ABC123
```
- 應返回該市場的詳細資訊 JSON

#### GET /api/users/[id]
```bash
curl http://localhost:3000/api/users/{userId}
```
- 應返回用戶資訊 JSON

#### GET /api/me
```bash
curl http://localhost:3000/api/me \
  -H "Cookie: pg_token=your_token_here"
```
- 需要有效的 token，應返回當前用戶資訊

#### GET /api/users/leaderboard/my-rank
```bash
curl http://localhost:3000/api/users/leaderboard/my-rank \
  -H "Cookie: pg_token=your_token_here"
```
- 需要有效的 token，應返回排行榜資訊

### 5. TypeScript 編譯檢查

```bash
cd prediction-web
npm run build
```

應無 TypeScript 錯誤。

### 6. Linter 檢查

```bash
cd prediction-web
npm run lint
```

應無 linter 錯誤。

## 架構說明

### Server Components vs Client Components

- **Public Pages (SEO)**: 全部使用 Server Components
  - `/(public)/page.tsx`
  - `/(public)/markets/page.tsx`
  - `/(public)/m/[id]/page.tsx`
  - `/(public)/leaderboard/page.tsx`
  - `/(public)/tag/[tag]/page.tsx`

- **Authenticated Pages**: 使用 Client Components
  - `/(authenticated)/wallet/page.tsx` - 有 'use client'
  - `/(authenticated)/profile/page.tsx` - 有 'use client'
  - `/(authenticated)/daily-bonus/page.tsx` - 有 'use client'
  - `/(authenticated)/referrals/page.tsx` - 有 'use client'

### API 呼叫架構

1. **前端頁面** → **BFF Route Handlers** (`/api/*`) → **後端 API**
2. Server Components 中的 API functions 可以直接呼叫後端（使用 serverFetch 或直接 fetch）
3. Client Components 中的 API functions 必須透過 BFF Route Handlers

### 資料流

```
Public Page (Server Component)
  → getMarkets() 
    → /api/markets (BFF)
      → Backend /markets

Authenticated Page (Client Component)
  → getMe()
    → /api/me (BFF)
      → Backend /me (with Bearer token from cookie)
```

## 注意事項

1. **環境變數**: 確保 `.env.local` 中有設定 `NEXT_PUBLIC_API_BASE_URL`
2. **後端服務**: 確保後端 API 服務正在運行
3. **認證**: 認證頁面需要先登入才能訪問
4. **SEO**: 所有公開頁面都應能在 view-source 中看到完整 HTML 內容

## 後續工作

1. 套用 Figma/shadcn UI 設計
2. 實作完整的排行榜功能
3. 實作每日獎勵功能
4. 實作推薦好友功能
5. 優化錯誤處理和載入狀態
6. 添加更多測試



