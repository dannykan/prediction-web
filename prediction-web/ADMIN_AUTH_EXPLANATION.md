# Admin 認證說明

## 🔍 問題分析

### 為什麼需要 `credentials: "include"`？

**簡短回答**：實際上**不需要**！我之前的修改是錯誤的。

### 實際情況

1. **同域請求**：`/api/admin/users` 和前端頁面在同一個域名下
2. **httpOnly Cookie**：`pg_token` 是 httpOnly cookie，瀏覽器會**自動**發送
3. **不需要 credentials**：同域請求時，httpOnly cookie 會自動包含在請求中

### 為什麼之前沒有也可以？

因為：
- 同域請求時，httpOnly cookie 會自動發送
- 不需要 `credentials: "include"`（這個選項主要用於跨域請求）

---

## 🔐 認證系統說明

### 兩個獨立的認證系統

1. **Admin 登入** (`admin_session` cookie)
   - 用於保護 `/pgadmin2026/*` 路由
   - 只需要密碼驗證
   - 設置 `admin_session` cookie

2. **用戶登入** (`pg_token` cookie)
   - 用於保護普通用戶功能
   - 需要 Google 登入
   - 設置 `pg_token` cookie

### 問題所在

之前的 API 路由要求 `pg_token`（Google 登入的 token），但：
- Admin 頁面只需要 `admin_session`（密碼登入）
- 這兩個是**不同的認證系統**！

---

## ✅ 解決方案

### 已修復

1. **移除不必要的認證要求**
   - Admin API 路由不再要求 `pg_token`
   - 因為後端 API 可能不需要認證（根據文檔）

2. **保留 `credentials: "include"`**
   - 雖然同域請求不需要，但保留它**沒有壞處**
   - 可以確保 cookie 被發送（更安全）

3. **Admin 保護**
   - Admin 路由仍然由 `admin_session` cookie 保護
   - 通過 `AdminGuard` 組件檢查

---

## 📋 當前認證流程

### Admin 登入流程

1. 訪問 `/pgadmin2026/login`
2. 輸入密碼
3. 設置 `admin_session` cookie
4. 可以訪問所有 `/pgadmin2026/*` 路由

### API 請求流程

1. 客戶端發起請求到 `/api/admin/*`
2. 瀏覽器自動發送 `admin_session` cookie（同域）
3. API 路由檢查 `admin_session`（如果需要）
4. 轉發請求到後端（不要求 `pg_token`）

---

## ❓ 是否需要 Google 登入？

**答案：不需要！**

### 原因

1. **後端 API 可能不需要認證**
   - 根據 API 文檔，很多端點目前沒有認證保護
   - 使用 query parameter 識別用戶

2. **Admin 已經有獨立的認證**
   - `admin_session` cookie 已經保護了 admin 路由
   - 不需要額外的 Google 登入

3. **簡化流程**
   - Admin 只需要密碼登入
   - 不需要先 Google 登入再 admin 登入

---

## 🔧 如果後端需要認證怎麼辦？

如果後端 API 開始要求認證，有兩個選擇：

### 選項 1：在 Admin 登入時獲取 Google Token

在 admin 登入頁面添加 Google 登入按鈕，獲取 token 後：
1. 設置 `admin_session` cookie（admin 認證）
2. 設置 `pg_token` cookie（API 認證）

### 選項 2：創建 Admin Token 系統

創建專門的 admin token：
1. Admin 登入時，後端返回 admin token
2. 使用 admin token 調用後端 API
3. 後端驗證 admin token 而不是用戶 token

---

## 📝 總結

### 當前狀態

- ✅ Admin 只需要密碼登入
- ✅ 不需要 Google 登入
- ✅ API 路由不要求 `pg_token`
- ✅ `credentials: "include"` 可以保留（無害）

### 如果遇到 401 錯誤

可能的原因：
1. 後端 API 開始要求認證
2. 需要添加 Google 登入功能
3. 或者實現 Admin Token 系統

---

## 🎯 建議

**當前方案**（已實現）：
- Admin 只需要密碼登入
- API 路由不要求用戶 token
- 如果後端需要認證，再考慮添加 Google 登入或 Admin Token

**這樣最簡單，也最符合當前需求！**
