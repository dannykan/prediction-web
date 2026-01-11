# Google Auth Web 平台登入修復

## 問題描述

在 Web 平台上，使用 Google 登入時出現以下問題：
- 點擊登入後，popup 視窗正常顯示
- 視窗關閉後跳回首頁，但仍處於訪客模式
- 錯誤日誌顯示：`⚠️ AuthException caught: Failed to retrieve Google ID Token`

## 根本原因

`google_sign_in` 套件在 Web 平台上無法可靠地提供 ID Token。根據日誌：
- ✅ 可以獲取 `access_token`
- ❌ 無法獲取 `idToken`（為 null）

這是 `google_sign_in` 套件在 Web 平台的已知限制。

## 解決方案

### 1. 後端修改

#### `prediction-backend/src/auth/auth.service.ts`
- ✅ 新增 `verifyGoogleAccessToken()` 方法
  - 使用 Google userinfo API 驗證 access_token
  - 獲取用戶資訊（email、name、picture）

- ✅ 修改 `login()` 方法
  - 支援接收 `accessToken` 參數
  - 當 `provider === 'google'` 且 `idToken` 為 null 時，使用 `accessToken` 驗證

#### `prediction-backend/src/auth/auth.controller.ts`
- ✅ 修改 `/auth/login` 端點
  - 新增可選的 `accessToken` 參數
  - 支援僅使用 `accessToken` 進行登入（當 `idToken` 不可用時）

### 2. 前端修改

#### `prediction-app/lib/features/auth/data/auth_repository.dart`
- ✅ 修改 `signInWithGoogle()` 方法
  - 檢查 `idToken` 是否為 null
  - 在 Web 平台上，當 `idToken` 為 null 但 `accessToken` 存在時，使用 `accessToken` 進行登入

- ✅ 修改 `authenticateWithBackend()` 方法
  - 新增可選的 `accessToken` 參數
  - 當 `accessToken` 存在時，將其發送到後端

## 驗證流程

### Web 平台登入流程（修復後）

```
1. 用戶點擊「使用 Gmail 登入」
   ↓
2. Google Sign-In popup 顯示
   ↓
3. 用戶選擇帳戶並授權
   ↓
4. 獲取 access_token（✅ 成功）
   ↓
5. 檢查 idToken：
   - 如果 idToken 存在 → 使用 idToken 驗證（標準流程）
   - 如果 idToken 為 null（Web 平台）→ 使用 access_token 驗證（新流程）
   ↓
6. 發送請求到後端：
   POST /auth/login
   {
     "accessToken": "ya29...",  // Web 平台使用
     "provider": "google"
   }
   ↓
7. 後端驗證 access_token（使用 Google userinfo API）
   ↓
8. 後端建立或更新用戶
   ↓
9. 返回用戶資訊
   ↓
10. 前端完成登入，跳轉到主頁
```

## 測試步驟

### 1. 本地測試

```bash
# 啟動後端
cd prediction-backend
npm run start:dev

# 啟動前端（Web）
cd prediction-app
flutter run -d chrome
```

### 2. 測試登入流程

1. 打開應用，進入登入頁面
2. 點擊「使用 Gmail 登入」
3. 在 popup 中選擇 Google 帳戶並授權
4. 確認 popup 關閉後，應用成功登入並跳轉到主頁

### 3. 檢查日誌

**前端日誌應該顯示**：
```
✅ Google user signed in: user@example.com
⚠️ ID Token not available on web, using access_token
```

**後端日誌應該顯示**：
```
[AuthController] Login request received { hasAccessToken: true, provider: 'google' }
[AuthService] Login attempt started { provider: 'google', hasAccessToken: true }
[AuthService] Google access token verified successfully { email: '...', displayName: '...', hasAvatar: true }
[AuthService] Login successful { userId: '...', email: '...', isNewUser: false, provider: 'google' }
```

## 向後兼容性

✅ **完全向後兼容**：
- 非 Web 平台（iOS、Android）仍然使用 `idToken` 進行驗證（不受影響）
- 如果 Web 平台上 `idToken` 可用，優先使用 `idToken`
- 只有當 `idToken` 為 null 時，才使用 `accessToken`

## 安全性

使用 `access_token` 進行驗證是安全的，因為：
1. 後端使用 Google 的 userinfo API 驗證 access_token
2. 後端直接與 Google API 通信，不依賴前端的聲明
3. Google API 會驗證 access_token 的有效性和範圍

## 相關文件

- [Google Auth 2.0 驗證指南](../prediction-backend/GOOGLE_AUTH_2.0_VERIFICATION.md)
- [Google Auth 2.0 快速測試](../prediction-backend/GOOGLE_AUTH_2.0_QUICK_TEST.md)
- [Safari Gmail 登入修復](../prediction-app/SAFARI_GMAIL_LOGIN_FIX.md)

## 更新歷史

- **2024-12-30**: 修復 Web 平台 Google 登入問題，支援使用 access_token 進行驗證






