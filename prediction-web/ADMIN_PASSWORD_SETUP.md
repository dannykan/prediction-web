# Admin 密碼保護設置指南

## 🔐 密碼保護功能

Admin 介面現在需要密碼驗證才能訪問。路由已從 `/admin` 更改為 `/pgadmin2026`。

---

## ⚙️ 環境變量設置

### 設置 Admin 密碼

在 `.env.local` 文件中添加：

```env
ADMIN_PASSWORD=pgadmin2026
```

**注意**：
- 默認密碼是 `pgadmin2026`（如果未設置環境變量）
- 在生產環境中，**必須**設置強密碼
- 建議使用環境變量管理工具（如 Cloudflare Pages 環境變量）來設置

---

## 🚀 使用方式

### 1. 訪問登入頁面

在瀏覽器中訪問：
```
http://localhost:3001/pgadmin2026/login
```

### 2. 輸入密碼

輸入管理員密碼（默認：`pgadmin2026`）

### 3. 登入後

登入成功後，會自動跳轉到：
```
http://localhost:3001/pgadmin2026
```

---

## 📋 功能說明

### 登入流程

1. **訪問任何 `/pgadmin2026/*` 路由**
   - 如果未登入，會自動重定向到 `/pgadmin2026/login`

2. **登入頁面** (`/pgadmin2026/login`)
   - 顯示密碼輸入框
   - 驗證密碼後設置 session cookie
   - 登入成功後跳轉到主頁

3. **Session 管理**
   - Session 有效期：24 小時
   - Cookie 使用 `httpOnly` 標誌（防止 XSS）
   - 在生產環境中使用 `secure` 標誌（僅 HTTPS）

### 登出功能

在 admin 主頁點擊「登出」按鈕，會：
- 清除 session cookie
- 重定向到登入頁面

---

## 🔧 API 端點

### POST /api/admin/auth/login
登入驗證

**請求**：
```json
{
  "password": "pgadmin2026"
}
```

**響應**：
```json
{
  "success": true
}
```

### POST /api/admin/auth/logout
登出

**響應**：
```json
{
  "success": true
}
```

### GET /api/admin/auth/check
檢查登入狀態

**響應**：
```json
{
  "authenticated": true
}
```

---

## 🛡️ 安全特性

1. **密碼驗證**
   - 密碼在服務器端驗證
   - 不會在前端暴露

2. **Session Cookie**
   - 使用 `httpOnly` 標誌，防止 JavaScript 訪問
   - 在生產環境使用 `secure` 標誌（僅 HTTPS）

3. **路由保護**
   - 所有 `/pgadmin2026/*` 路由都受到保護
   - 未登入用戶會自動重定向到登入頁

4. **自動登出**
   - Session 過期後需要重新登入
   - 可以手動登出

---

## 📝 路由結構

```
/pgadmin2026
├── /login          # 登入頁面（公開）
├── /               # 主頁（受保護）
├── /markets        # 市場管理（受保護）
│   └── /[marketId] # 市場詳情（受保護）
├── /users          # 用戶管理（受保護）
├── /bets           # 下注管理（受保護）
├── /comments       # 評論管理（受保護）
├── /tasks          # 任務管理（受保護）
└── /reward-configs # 獎勵配置（受保護）
```

---

## ⚠️ 注意事項

### 生產環境設置

1. **設置強密碼**
   ```env
   ADMIN_PASSWORD=your-strong-password-here
   ```

2. **使用環境變量管理**
   - 在 Cloudflare Pages 中設置環境變量
   - 不要在代碼中硬編碼密碼

3. **HTTPS 要求**
   - 在生產環境中，cookie 會自動使用 `secure` 標誌
   - 確保網站使用 HTTPS

### 開發環境

- 默認密碼：`pgadmin2026`
- 可以在 `.env.local` 中設置自定義密碼

---

## 🧪 測試步驟

1. **測試登入**
   ```bash
   # 訪問登入頁面
   http://localhost:3001/pgadmin2026/login
   
   # 輸入密碼：pgadmin2026
   # 應該成功登入並跳轉到主頁
   ```

2. **測試路由保護**
   ```bash
   # 直接訪問受保護的路由（未登入）
   http://localhost:3001/pgadmin2026
   # 應該自動重定向到登入頁
   ```

3. **測試登出**
   ```bash
   # 在 admin 主頁點擊「登出」
   # 應該清除 session 並跳轉到登入頁
   ```

4. **測試 Session 持久性**
   ```bash
   # 登入後，刷新頁面
   # 應該保持登入狀態
   ```

---

## 🐛 常見問題

### Q: 輸入正確密碼但無法登入

**A**: 檢查：
1. `.env.local` 中的 `ADMIN_PASSWORD` 是否正確
2. 後端服務器是否正在運行
3. 瀏覽器控制台是否有錯誤

### Q: 登入後立即被登出

**A**: 檢查：
1. Cookie 設置是否正確
2. 瀏覽器是否阻止了 cookie
3. 是否在無痕模式下（某些瀏覽器會限制 cookie）

### Q: 無法訪問受保護的路由

**A**: 確保：
1. 已經成功登入
2. Session cookie 沒有過期
3. 瀏覽器允許 cookie

---

## 📞 技術細節

### Cookie 設置

```typescript
{
  httpOnly: true,           // 防止 JavaScript 訪問
  secure: isProduction,    // 生產環境僅 HTTPS
  sameSite: "lax",         // CSRF 保護
  maxAge: 60 * 60 * 24,    // 24 小時
  path: "/"                 // 全站可用
}
```

### 路由保護機制

使用 `AdminGuard` 組件包裹所有受保護的路由：
- 檢查 session cookie
- 未登入時重定向到登入頁
- 顯示載入狀態

---

## 🎯 下一步

- [ ] 添加密碼強度要求
- [ ] 添加登入嘗試次數限制
- [ ] 添加雙因素認證（2FA）
- [ ] 添加審計日誌（記錄所有登入/登出）
