# 🔧 Cloudflare Pages 環境變量設置

## 🚨 當前問題

從瀏覽器控制台看到以下錯誤：

1. ❌ `GET https://predictiongod.app/api/me 501` - 錯誤的域名
2. ❌ `GET https://predictiongod.app/api/markets 500` - 錯誤的域名
3. ❌ `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set` - 環境變量缺失

### 根本原因

Cloudflare Pages **沒有設置生產環境變量**，導致：
- 應用使用默認/錯誤的 API URL
- Google OAuth 無法初始化
- API 請求失敗

---

## ✅ 解決方案

### 步驟 1: 設置 Cloudflare Pages 環境變量

1. **訪問 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/[account]/pages/predictiongod/settings/environment-variables
   ```

2. **添加 Production 環境變量**

   點擊 "Add variable"，添加以下變量：

   #### 必需的環境變量

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-production-8f6c.up.railway.app` | Production |
   | `NEXT_PUBLIC_SITE_URL` | `https://predictiongod.pages.dev` | Production |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com` | Production |
   | `NODE_VERSION` | `20` | Production |

   **重要**：
   - Environment 選擇 **"Production"**
   - 不要選 "Preview"（除非你需要）

3. **保存設置**

   點擊 "Save" 保存所有環境變量

---

## 📝 環境變量說明

### 1. `NEXT_PUBLIC_API_BASE_URL`

**作用**: API 請求的基礎 URL

**正確值**:
```
https://prediction-backend-production-8f6c.up.railway.app
```

**為什麼需要**:
- 前端需要知道後端 API 的地址
- 所有 `/api/*` 請求會代理到這個 URL
- 如果沒設置，會使用錯誤的默認值

### 2. `NEXT_PUBLIC_SITE_URL`

**作用**: 網站的公開 URL

**正確值**:
```
https://predictiongod.pages.dev
```

**為什麼需要**:
- Open Graph 元數據
- Canonical URLs
- OAuth redirect URLs
- Sitemap 生成

### 3. `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**作用**: Google OAuth 客戶端 ID

**正確值**:
```
533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
```

**為什麼需要**:
- Google 登入功能
- 如果沒設置，會看到錯誤：`NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set`

### 4. `NODE_VERSION`

**作用**: 指定 Node.js 版本

**正確值**:
```
20
```

**為什麼需要**:
- 確保構建環境與本地一致
- Next.js 16 需要 Node.js 18+

---

## 🔍 驗證環境變量

### 方法 1: 檢查 Cloudflare Dashboard

1. 訪問 Environment Variables 頁面
2. 確認所有 4 個變量都存在
3. 確認 Environment 是 "Production"

### 方法 2: 觸發新部署

設置環境變量後，需要**重新部署**：

```bash
# 推送一個小改動觸發部署
echo "# Trigger rebuild with env vars" >> prediction-web/.env.trigger
git add prediction-web/.env.trigger
git commit -m "chore: Trigger rebuild after env vars setup"
git push origin main
```

或者在 Cloudflare Dashboard 中：
```
Deployments → 最新部署 → Retry deployment
```

### 方法 3: 檢查構建日誌

新部署的構建日誌應該顯示環境變量已設置：
```
Environment:
  NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
  NEXT_PUBLIC_SITE_URL=https://predictiongod.pages.dev
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=533269043110-***
  NODE_VERSION=20
```

---

## 🎯 部署後驗證

### 1. 檢查 API 請求

打開瀏覽器控制台（F12），刷新頁面：

**修復前** ❌:
```
GET https://predictiongod.app/api/me 501
GET https://predictiongod.app/api/markets 500
```

**修復後** ✅:
```
GET https://prediction-backend-production-8f6c.up.railway.app/api/me 200
GET https://prediction-backend-production-8f6c.up.railway.app/api/markets 200
```

### 2. 檢查 Google 登入

**修復前** ❌:
```
Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set
```

**修復後** ✅:
- Google 登入按鈕可點擊
- 點擊後彈出 Google OAuth 視窗
- 登入成功

### 3. 檢查網頁元素

在瀏覽器中查看源代碼（右鍵 → 查看源代碼）：

搜索 `og:url`，應該看到：
```html
<meta property="og:url" content="https://predictiongod.pages.dev/home" />
```

而不是：
```html
<meta property="og:url" content="http://localhost:3000/home" />
```

---

## 🚨 常見錯誤

### 錯誤 1: 環境變量設置到 Preview 而不是 Production

**症狀**: 設置了環境變量但仍不工作

**解決**:
- 檢查環境變量的 "Environment" 列
- 應該是 **"Production"** 而不是 "Preview"
- 刪除 Preview 的變量，重新添加到 Production

### 錯誤 2: 環境變量名稱拼寫錯誤

**症狀**: 部分功能工作，部分不工作

**解決**:
- 仔細檢查變量名稱
- 必須是 `NEXT_PUBLIC_API_BASE_URL`（不是 `API_BASE_URL`）
- 必須是 `NEXT_PUBLIC_SITE_URL`（不是 `SITE_URL`）

### 錯誤 3: 設置後沒有重新部署

**症狀**: 設置了環境變量但控制台仍顯示錯誤

**解決**:
- 環境變量只在**新的構建**中生效
- 必須觸發新部署
- 或者點擊 "Retry deployment"

### 錯誤 4: API URL 包含尾部斜線

**症狀**: API 請求 404

**錯誤值**:
```
https://prediction-backend-production-8f6c.up.railway.app/  ❌
```

**正確值**:
```
https://prediction-backend-production-8f6c.up.railway.app  ✅
```

---

## 📋 完整檢查清單

設置環境變量後，檢查以下項目：

### Cloudflare Dashboard
- [ ] `NEXT_PUBLIC_API_BASE_URL` 已設置
- [ ] `NEXT_PUBLIC_SITE_URL` 已設置
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已設置
- [ ] `NODE_VERSION` 已設置
- [ ] 所有變量的 Environment 是 "Production"

### 部署
- [ ] 觸發了新的部署
- [ ] 構建成功
- [ ] 部署成功

### 網站功能
- [ ] 頁面正常加載
- [ ] API 請求返回 200（不是 501/500）
- [ ] Google 登入按鈕可用
- [ ] 控制台沒有環境變量錯誤

---

## 🔄 Preview vs Production 環境變量

如果你需要為 Preview 部署設置不同的環境變量：

### Preview 環境（可選）

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-staging.up.railway.app` | Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://preview.predictiongod.pages.dev` | Preview |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `[staging-client-id]` | Preview |

這樣 preview 部署會使用 staging 後端，production 使用 production 後端。

---

## 🛠️ 其他可能需要的環境變量

根據應用功能，可能還需要：

### 資料庫連接（如果前端直接訪問）
```
DATABASE_URL=[不要在前端暴露]
```
**注意**: 不要設置以 `NEXT_PUBLIC_` 開頭的資料庫變量！

### 其他 API Keys
```
NEXT_PUBLIC_ANALYTICS_ID=...
NEXT_PUBLIC_SENTRY_DSN=...
```

### 功能開關
```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## 📞 如果仍有問題

### 收集信息

1. **Cloudflare 環境變量截圖**
   - 顯示所有已設置的變量
   - 顯示 Environment 列

2. **瀏覽器控制台錯誤**
   - F12 → Console
   - F12 → Network
   - 截圖所有錯誤

3. **構建日誌**
   - 最新部署的完整日誌
   - 特別是環境變量部分

### 臨時調試

在 `src/lib/config.ts`（或類似文件）中添加日誌：

```typescript
console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
```

然後查看瀏覽器控制台輸出。

---

## 🎉 成功指標

環境變量正確設置後，應該看到：

### 瀏覽器控制台
- ✅ 沒有 "is not set" 錯誤
- ✅ API 請求到正確的域名
- ✅ 所有 API 請求返回 200 或 401（而不是 501/500）

### 網站功能
- ✅ Google 登入按鈕可用
- ✅ 市場數據正常加載
- ✅ 用戶資料正常獲取
- ✅ 所有功能正常工作

### 元數據
- ✅ Open Graph URLs 正確
- ✅ Canonical URLs 正確
- ✅ 分享連結正確

---

## 📝 環境變量模板

### 複製此模板到 Cloudflare Pages

```
# Production Environment Variables

NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.pages.dev
NEXT_PUBLIC_GOOGLE_CLIENT_ID=533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com
NODE_VERSION=20
```

### 設置步驟

1. 複製上面的值
2. 訪問 Cloudflare Pages → Settings → Environment Variables
3. 為每個變量點擊 "Add variable"
4. 粘貼名稱和值
5. Environment 選擇 "Production"
6. 保存
7. 重新部署

---

**完成這些設置後，網站應該完全正常運作！** 🚀
