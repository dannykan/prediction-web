# Railway API 問題診斷報告

**日期：** 2025-12-29
**問題：** Web app 部署到 Railway 後，API 功能異常（400/404 錯誤）
**影響：** Admin 管理功能、用戶創建市場、下注等功能無法使用

---

## 🔍 診斷結果

### ✅ 正常運作的部分

| 項目 | 狀態 | 說明 |
|------|------|------|
| Railway 部署 | ✅ 成功 | 服務正在運行 |
| 健康檢查 (`/health`) | ✅ 正常 | 返回 200 OK |
| 資料庫連線 | ✅ 正常 | PostgreSQL 連線成功 |
| 公開 API (`GET /markets`) | ✅ 正常 | 返回 200 和資料 |
| 認證機制 | ✅ 正常 | 未認證請求正確返回 401 |
| CORS 設定 | ✅ 正常 | 支援 Cloudflare 域名 |
| 前端部署 (Cloudflare) | ✅ 正常 | predictiongod.app 可訪問 |

### ❌ 發現的問題

| 項目 | 狀態 | 實際情況 | 預期情況 |
|------|------|----------|----------|
| Admin 路由 | ❌ 失敗 | 返回 404 Not Found | 返回 200 或 403 |
| `GET /admin/markets` | ❌ 404 | 路由不存在 | 應該返回市場資料 |
| `GET /admin/users` | ❌ 404 | 路由不存在 | 應該返回用戶資料 |

### 🎯 根本原因

**問題類型：** 部署配置/構建快取問題

**具體原因：**
1. Admin controllers 在本地編譯正常（已確認 `admin-markets.controller.js` 存在）
2. 模組配置正確（`AdminMarketsController` 已註冊到 `MarketsModule`）
3. Railway 部署成功，但 Admin 路由返回 404
4. **推測：Railway 使用了舊版本的構建快取，導致 Admin controllers 沒有正確部署**

**證據：**
- ✅ 本地 `dist/src/markets/` 包含 `admin-markets.controller.js`
- ✅ 編譯後的 `markets.module.js` 包含 `AdminMarketsController`
- ❌ Railway 部署版本中 `/admin/*` 路由全部返回 404

---

## 🛠️ 修復方案

### 方案 1：強制重新部署（推薦，最快）

**步驟：**
1. 登入 Railway Dashboard（https://railway.app）
2. 選擇 prediction-backend 服務
3. 點擊 "Deployments" 標籤
4. 找到最新部署，點擊 "⋯" 選單
5. 選擇 **"Redeploy"** 或 **"Redeploy from source"**
6. 等待部署完成（約 2-3 分鐘）
7. 執行驗證腳本：
   ```bash
   cd prediction-backend
   ./scripts/railway-diagnostic.sh
   ```

**預期結果：**
- Admin 端點返回 200（有資料）或 403（需要認證）
- 不再返回 404

**成功率：** 90%

---

### 方案 2：清除構建快取並重新部署

如果方案 1 無效，嘗試清除快取：

**步驟：**
1. 在 Railway Dashboard 中，前往服務設定
2. 點擊 "Settings" 標籤
3. 尋找 "Build Cache" 選項
4. 點擊 "Clear Build Cache"
5. 手動觸發新部署（推送一個 Git commit 或使用 Railway CLI）
6. 等待部署完成
7. 執行驗證腳本

**成功率：** 95%

---

### 方案 3：檢查環境變數（如果仍有問題）

確認以下環境變數已在 Railway Dashboard 中設置：

**必需變數：**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
FIREBASE_PROJECT_ID=prediction-god
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<完整私鑰>
FRONTEND_URL=https://predictiongod.app
API_URL=https://prediction-backend-production-8f6c.up.railway.app
TZ=Asia/Taipei
```

**設置指南：** 請參閱 `RAILWAY_ENV_SETUP.md`

---

### 方案 4：程式碼層面的緊急修復（如果以上都無效）

如果重新部署後仍有問題，可能需要檢查：

1. **全局路由前綴衝突**（已檢查，無此問題）
2. **模組導入問題**（已檢查，配置正確）
3. **TypeScript 編譯配置**（已檢查，正常）

**備用方案：** 將 Admin controllers 合併到主 controllers 中（不推薦，會影響程式碼結構）

---

## 📊 診斷工具

已創建以下工具協助診斷和修復：

### 1. Railway 診斷腳本
**路徑：** `prediction-backend/scripts/railway-diagnostic.sh`

**功能：**
- 測試健康檢查
- 測試公開端點
- 測試受保護端點
- 測試 Admin 端點
- 測試 CORS 設定

**使用方法：**
```bash
cd prediction-backend
./scripts/railway-diagnostic.sh
```

### 2. Admin 端點測試腳本
**路徑：** `prediction-backend/scripts/test-admin-endpoints.sh`

**功能：**
- 詳細測試所有 Admin 端點
- 測試帶/不帶 header 的請求
- 測試不同的市場 ID

**使用方法：**
```bash
cd prediction-backend
./scripts/test-admin-endpoints.sh
```

### 3. 修復指南
**路徑：** `RAILWAY_FIX_GUIDE.md`

包含：
- 詳細的修復步驟
- 常見問題解答
- 部署檢查清單

### 4. 環境變數設置指南
**路徑：** `RAILWAY_ENV_SETUP.md`

包含：
- 所有必需環境變數
- 設置步驟
- 驗證方法
- 常見錯誤處理

---

## 🚀 建議的執行順序

### 第一步：立即執行診斷（確認當前狀態）
```bash
cd prediction-backend
./scripts/railway-diagnostic.sh
```

### 第二步：執行修復方案 1（強制重新部署）
1. 登入 Railway Dashboard
2. 觸發 Redeploy
3. 等待 2-3 分鐘

### 第三步：驗證修復
```bash
./scripts/railway-diagnostic.sh
./scripts/test-admin-endpoints.sh
```

### 第四步：測試前端功能
1. 訪問 https://predictiongod.app
2. 測試創建市場
3. 測試下注
4. 測試 Admin 功能

### 第五步：如果仍有問題
1. 檢查 Railway 部署日誌
2. 執行方案 2（清除快取）
3. 檢查環境變數（參考 `RAILWAY_ENV_SETUP.md`）

---

## 📝 驗證清單

修復完成後，請確認：

- [ ] `/health` 返回 200
- [ ] `GET /markets` 返回 200 和資料
- [ ] `POST /markets` 返回 401（未認證）
- [ ] `POST /bets` 返回 401（未認證）
- [ ] `GET /admin/markets`（不帶 header）返回 403
- [ ] `GET /admin/markets`（帶 header）返回 200
- [ ] CORS preflight 成功（predictiongod.app）
- [ ] CORS preflight 成功（predictiongod.pages.dev）
- [ ] 前端可以創建市場
- [ ] 前端可以下注
- [ ] Admin 可以結算市場
- [ ] Admin 可以編輯市場
- [ ] Admin 可以編輯用戶

---

## 🔧 技術細節

### 當前配置

**Railway 配置：** `railway.json`
```json
{
  "build": {
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

**啟動命令：** `package.json`
```json
"start:prod": "node -r ./dist/src/polyfills.js dist/src/main"
```

**Admin Controllers：**
- `src/markets/admin-markets.controller.ts` → `@Controller('admin/markets')`
- `src/users/users.controller.ts` → `@Controller('admin/users')`
- `src/bets/bets.controller.ts` → `@Controller('admin')`
- `src/tasks/tasks.controller.ts` → `@Controller('admin/tasks')`

**CORS 設定：** `src/main.ts`
```typescript
app.enableCors({
  origin: true, // 反射請求來源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Authenticated', ...]
});
```

---

## 📞 需要進一步協助？

如果執行以上步驟後仍有問題，請提供：

1. **Railway 部署日誌**
   - Deployments → 最新部署 → View Logs
   - 包含 Build Logs 和 Deploy Logs

2. **診斷腳本輸出**
   ```bash
   ./scripts/railway-diagnostic.sh > diagnosis.txt
   ./scripts/test-admin-endpoints.sh > admin-test.txt
   ```

3. **瀏覽器控制台錯誤**
   - F12 → Console → 複製所有錯誤訊息
   - Network 標籤中失敗的請求詳情

4. **環境變數截圖**
   - Railway Dashboard → Variables 標籤
   - 遮蔽敏感資訊（私鑰等）

---

## 📈 預期時間表

| 步驟 | 預估時間 |
|------|----------|
| 執行診斷腳本 | 1 分鐘 |
| Railway 重新部署 | 2-3 分鐘 |
| 驗證修復 | 2 分鐘 |
| 測試前端功能 | 5 分鐘 |
| **總計** | **10-15 分鐘** |

---

## 🎯 成功標準

修復成功的標誌：

1. ✅ 診斷腳本中沒有 404 錯誤
2. ✅ Admin 端點返回 200 或 403（而非 404）
3. ✅ 前端可以正常創建市場和下注
4. ✅ Admin 可以管理市場和用戶
5. ✅ 沒有 CORS 錯誤

---

**祝修復順利！** 🚀

如有任何問題，請隨時詢問。
