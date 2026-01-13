# 🔧 生產環境錯誤修復指南

## 🚨 當前錯誤

從 `predictiongod.app` 控制台看到的錯誤：

1. ❌ `GET https://predictiongod.app/api/me 501 (Not Implemented)`
2. ❌ `GET https://predictiongod.app/api/markets?status=OPEN 500 (Internal Server Error)`
3. ❌ `GET https://predictiongod.app/leaderboard?_rsc=dt7rl 404 (Not Found)`
4. ❌ `GET https://predictiongod.app/home?_rsc=dt7rl 404 (Not Found)`
5. ❌ `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set`

---

## 🔍 根本原因分析

### 1. API 路由錯誤（501/500）

**問題**：
- `/api/me` 返回 501：因為 `NEXT_PUBLIC_API_BASE_URL` 未設置，導致 `getApiBaseUrl()` 拋出錯誤
- `/api/markets` 返回 500：同樣因為缺少環境變量

**原因**：
- Cloudflare Pages 沒有設置生產環境變量
- API 路由無法連接到後端服務器

### 2. 路由 404 錯誤

**問題**：
- `/leaderboard` 和 `/home` 返回 404

**原因**：
- Next.js App Router 在 Cloudflare Pages 上需要正確的路由配置
- 可能是構建輸出或路由配置問題

### 3. Google OAuth 錯誤

**問題**：
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set`

**原因**：
- 環境變量未在 Cloudflare Pages 中設置

---

## ✅ 解決方案

### 步驟 1: 設置 Cloudflare Pages 環境變量（**必須立即執行**）

1. **訪問 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com
   ```

2. **進入 Pages 項目設置**
   - 左側導航：**Workers & Pages** → **Pages**
   - 找到項目：**predictiongod**
   - 點擊項目進入詳情頁
   - 點擊頂部 **Settings** 標籤
   - 左側選單：**Environment variables**

3. **添加以下環境變量**

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-production-8f6c.up.railway.app` | ✅ Production |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com` | ✅ Production |
   | `NEXT_PUBLIC_SITE_URL` | `https://predictiongod.app` | ✅ Production |
   | `NODE_VERSION` | `20` | ✅ Production |

   **重要**：
   - ✅ 必須選擇 **Production** 環境
   - ⚠️ 如果只選擇 Preview，生產環境仍然會失敗
   - 點擊 **Save** 保存

4. **重新部署**

   設置環境變量後，需要觸發新的部署：

   **方法 A：通過 Git 推送**
   ```bash
   # 做一個小改動並推送
   git commit --allow-empty -m "Trigger redeploy with env vars"
   git push
   ```

   **方法 B：在 Cloudflare Dashboard 中重新部署**
   - 進入 **Deployments** 標籤
   - 找到最新的部署
   - 點擊右側 **...** 選單
   - 選擇 **Retry deployment**

---

### 步驟 2: 驗證環境變量設置

部署完成後，檢查：

1. **檢查構建日誌**
   - 在 Cloudflare Dashboard 中查看最新部署的構建日誌
   - 確認沒有 `NEXT_PUBLIC_API_BASE_URL is not set` 錯誤

2. **檢查運行時錯誤**
   - 訪問 `https://predictiongod.app`
   - 打開瀏覽器開發者工具（F12）
   - 檢查 Console 和 Network 標籤
   - 應該不再看到：
     - ❌ `NEXT_PUBLIC_API_BASE_URL is not set`
     - ❌ `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set`
     - ❌ `501 Not Implemented` (對於 `/api/me`)
     - ❌ `500 Internal Server Error` (對於 `/api/markets`)

---

### 步驟 3: 修復路由 404 問題

如果設置環境變量後，`/leaderboard` 和 `/home` 仍然返回 404：

1. **檢查構建輸出**
   - 確認 `.open-next` 目錄包含所有路由文件
   - 檢查 `wrangler.toml` 中的 `pages_build_output_dir` 設置

2. **檢查路由文件**
   - 確認 `src/app/(public)/leaderboard/page.tsx` 存在
   - 確認 `src/app/(public)/home/page.tsx` 存在

3. **如果需要，創建 `_routes.json`**

   在項目根目錄創建 `_routes.json`：
   ```json
   {
     "version": 1,
     "include": ["/*"],
     "exclude": ["/api/*"]
   }
   ```

   但通常 Cloudflare Pages 會自動處理 Next.js 路由，所以先嘗試設置環境變量並重新部署。

---

## 📋 環境變量詳細說明

### `NEXT_PUBLIC_API_BASE_URL`

**作用**：後端 API 的基礎 URL

**值**：
```
https://prediction-backend-production-8f6c.up.railway.app
```

**為什麼需要**：
- 所有 `/api/*` BFF 路由需要這個 URL 來代理請求到後端
- 如果未設置，`getApiBaseUrl()` 會拋出錯誤，導致 API 路由返回 500/501

---

### `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**作用**：Google OAuth Web Client ID

**值**：
```
533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

**為什麼需要**：
- Google 登入功能需要這個 ID 來初始化 Google Sign-In
- 如果未設置，會看到 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 錯誤

---

### `NEXT_PUBLIC_SITE_URL`

**作用**：網站的公開 URL（用於 OAuth redirect、Open Graph 等）

**值**：
```
https://predictiongod.app
```

**為什麼需要**：
- OAuth redirect URLs
- Open Graph meta tags
- Canonical URLs

---

### `NODE_VERSION`

**作用**：指定 Node.js 版本

**值**：
```
20
```

**為什麼需要**：
- 確保構建和運行時使用正確的 Node.js 版本
- Next.js 和依賴項需要特定版本

---

## 🧪 測試步驟

設置環境變量並重新部署後：

1. **測試 API 路由**
   ```bash
   # 應該返回 401（未登入）而不是 501
   curl https://predictiongod.app/api/me
   
   # 應該返回市場列表而不是 500
   curl https://predictiongod.app/api/markets?status=OPEN
   ```

2. **測試頁面路由**
   - 訪問 `https://predictiongod.app/home` - 應該顯示首頁
   - 訪問 `https://predictiongod.app/leaderboard` - 應該顯示排行榜

3. **測試 Google 登入**
   - 打開瀏覽器控制台
   - 應該不再看到 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 錯誤
   - 點擊登入按鈕，應該能正常初始化 Google Sign-In

---

## 📝 已修復的代碼

### 1. `/api/me` 路由改進

已更新錯誤處理，現在會：
- 明確檢查 `NEXT_PUBLIC_API_BASE_URL` 是否設置
- 返回更清晰的錯誤訊息（500 而不是 501，當配置錯誤時）
- 區分配置錯誤和網絡錯誤

### 2. `/api/markets` 路由改進

已更新錯誤處理，現在會：
- 明確檢查 `NEXT_PUBLIC_API_BASE_URL` 是否設置
- 返回更清晰的錯誤訊息

---

## ⚠️ 重要提醒

1. **環境變量必須在 Cloudflare Dashboard 中設置**
   - 不能只在本地 `.env` 文件中設置
   - 必須在 Cloudflare Pages 項目設置中添加

2. **必須選擇 Production 環境**
   - 如果只選擇 Preview，生產環境仍然會失敗

3. **設置後必須重新部署**
   - 環境變量在構建時和運行時都需要
   - 設置後需要觸發新的部署

4. **檢查構建日誌**
   - 確認環境變量在構建時可用
   - 確認沒有配置錯誤

---

## 🎯 預期結果

修復後，應該：

✅ `/api/me` 返回 401（未登入）或 200（已登入），而不是 501  
✅ `/api/markets` 返回 200 和市場列表，而不是 500  
✅ `/home` 和 `/leaderboard` 正常顯示，而不是 404  
✅ Google 登入功能正常初始化，沒有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` 錯誤  
✅ 控制台沒有配置相關錯誤

---

## 📞 如果問題仍然存在

如果設置環境變量並重新部署後，問題仍然存在：

1. **檢查構建日誌**
   - 確認環境變量在構建時可用
   - 確認構建成功完成

2. **檢查運行時日誌**
   - 在 Cloudflare Dashboard 中查看 Functions 日誌
   - 確認 API 路由是否正確執行

3. **檢查後端服務器**
   - 確認 `https://prediction-backend-production-8f6c.up.railway.app` 正常運行
   - 測試後端 `/me` 和 `/markets` 端點

4. **檢查網絡請求**
   - 在瀏覽器開發者工具的 Network 標籤中檢查
   - 確認請求是否正確發送到後端
