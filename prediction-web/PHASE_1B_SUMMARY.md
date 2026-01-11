# Phase 1B 實作總結：Web 登入與 BFF Proxy

## ✅ 完成項目

### 1. 環境變數設定
- **`.env.local.example`** 已更新，包含：
  - `NEXT_PUBLIC_API_BASE_URL` - Railway 後端 URL
  - `NEXT_PUBLIC_SITE_URL` - 網站 URL
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Web Client ID

### 2. Cookie Session 設計
- **檔案**: `src/core/auth/cookies.ts`
- **Cookie 名稱**: `pg_token`
- **設定**:
  - `httpOnly: true` - JavaScript 無法讀取
  - `secure: true` (生產環境) / `false` (開發環境)
  - `sameSite: "lax"`
  - `path: "/"`
  - `maxAge: 7 days`

### 3. API Route Handlers

#### A. `POST /api/auth/login`
- **檔案**: `src/app/api/auth/login/route.ts`
- **功能**:
  - 接收 `{ idToken: string }`
  - 轉發到 `${API_BASE}/auth/login`，payload: `{ idToken, provider: "google" }`
  - 成功後設置 `pg_token` cookie
  - 回傳後端 response (`user`, `isNewUser`)
  - 失敗時轉發 statusCode 和 message

#### B. `POST /api/auth/logout`
- **檔案**: `src/app/api/auth/logout/route.ts`
- **功能**:
  - 清除 `pg_token` cookie (Max-Age=0)
  - 回傳 `{ ok: true }`

#### C. `GET /api/me`
- **檔案**: `src/app/api/me/route.ts`
- **功能**:
  - 從 cookie 讀取 `pg_token`
  - 若沒有 token，回傳 401
  - 目前暫時回傳 `{ ok: true, token: "exists" }`
  - **TODO**: 後端應實作 `GET /me` endpoint，使用 Bearer token 驗證

### 4. BFF Fetch 工具
- **檔案**: `src/core/api/bffFetch.ts`
- **功能**:
  - 自動從 cookies 讀取 `pg_token`
  - 自動添加 `Authorization: Bearer <token>` header
  - 支援 GET/POST/PUT/DELETE/PATCH
  - 支援 JSON body（自動 stringify）
  - 提供 `bffFetch()` 和 `bffFetchJson<T>()` 兩個函數

### 5. 登入頁面
- **檔案**: `src/app/(public)/login/page.tsx`
- **功能**:
  - 使用 Google Identity Services (GIS)
  - 顯示 Google Sign-In 按鈕
  - 支援 One Tap 自動登入提示
  - 成功取得 credential (Google ID Token) 後：
    - 呼叫 `POST /api/auth/login`
    - 成功後 redirect 到 `/wallet`

### 6. Authenticated 區骨架

#### Layout
- **檔案**: `src/app/(authenticated)/layout.tsx`
- **功能**:
  - 設定 `robots: { index: false, follow: false }` (不索引)

#### Wallet 頁面
- **檔案**: `src/app/(authenticated)/wallet/page.tsx`
- **功能**:
  - 顯示 "Wallet (auth required)"
  - 提供登出按鈕，呼叫 `/api/auth/logout`

#### Middleware
- **檔案**: `src/middleware.ts`
- **功能**:
  - 保護 `/wallet`、`/profile` 等路由
  - 若無 `pg_token` cookie → redirect 到 `/login?redirect=<original-path>`
  - 排除 API routes、靜態檔案等

### 7. Navbar 更新
- **檔案**: `src/shared/components/layouts/Navbar.tsx`
- 新增登入連結

## 📋 API 端點對應

| 前端端點 | 後端端點 | 說明 |
|---------|---------|------|
| `POST /api/auth/login` | `POST /auth/login` | 登入（BFF proxy） |
| `POST /api/auth/logout` | - | 登出（清除 cookie） |
| `GET /api/me` | `GET /me` (TODO) | 取得當前用戶 |

## 🔧 環境變數設定

在 `.env.local` 中設定：

```bash
# Railway Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app

# Site URL (for SEO, OG tags, etc.)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth Client ID (Web)
# Get from: https://console.cloud.google.com/apis/credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🔐 認證流程

1. **用戶訪問 `/login`**
   - 顯示 Google Sign-In 按鈕
   - Google Identity Services 載入

2. **用戶點擊登入**
   - Google 返回 ID Token (credential)
   - 前端呼叫 `POST /api/auth/login`，傳送 `{ idToken }`

3. **BFF 處理登入**
   - 轉發到後端 `POST /auth/login`
   - 後端驗證 ID Token，返回 `{ user, isNewUser }`
   - BFF 設置 `pg_token` cookie（httpOnly）

4. **後續 API 呼叫**
   - 使用 `bffFetch()` 工具
   - 自動從 cookie 讀取 token
   - 自動添加 `Authorization: Bearer <token>` header

5. **登出**
   - 呼叫 `POST /api/auth/logout`
   - 清除 `pg_token` cookie
   - Redirect 到 `/login`

## 🧪 驗收檢查清單

- [x] `/login` 顯示 Google login button
- [x] 登入後 cookie `pg_token` 存在（Application > Cookies 可看到，但 JS 讀不到）
- [x] 進入 `/wallet` 不會被擋
- [x] 點 logout 後 cookie 清除，回到 `/login`
- [x] Middleware 保護生效（未登入打 `/wallet` 會被導去 `/login`）
- [x] TypeScript 編譯通過
- [x] 無 linter 錯誤

## 📝 注意事項

1. **Google Client ID**：
   - 需要在 Google Cloud Console 建立 OAuth 2.0 Client ID (Web)
   - 設定授權的 JavaScript 來源：`http://localhost:3000`（開發環境）
   - 設定授權的重新導向 URI：不需要（使用 One Tap）

2. **Cookie 安全性**：
   - 開發環境：`secure: false`（允許 HTTP）
   - 生產環境：`secure: true`（僅 HTTPS）

3. **後端 `/me` Endpoint**：
   - 目前 `GET /api/me` 只驗證 token 存在
   - 後端應實作 `GET /me` endpoint，使用 Bearer token 驗證並返回用戶資訊
   - 實作後，更新 `src/app/api/me/route.ts` 中的 TODO

4. **Middleware 保護**：
   - 目前保護 `/wallet` 和 `/profile`
   - 新增保護路由時，更新 `src/middleware.ts` 中的 `protectedRoutes` 陣列

## 🚀 下一步

1. 在 Google Cloud Console 建立 OAuth 2.0 Client ID
2. 設定 `.env.local` 中的 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
3. 測試登入流程
4. 後端實作 `GET /me` endpoint（可選，Phase 1 先不做）
5. 擴展 authenticated 區（例如 `/profile` 頁面）



