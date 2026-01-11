# Railway 環境變數設置指南

## 📋 必需的環境變數

請在 Railway Dashboard → 你的服務 → Variables 中設置以下環境變數：

### 1. 資料庫配置

```bash
# Railway PostgreSQL 會自動注入此變數
# 請確保你的服務已連接到 PostgreSQL 服務
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**設置方式：**
1. 在 Railway Dashboard 中，確保你已添加 PostgreSQL 服務
2. 在 Backend 服務的 Variables 中，添加變數 `DATABASE_URL`
3. 值設為：`${{Postgres.DATABASE_URL}}`（Railway 會自動解析）

---

### 2. Node 環境

```bash
NODE_ENV=production
```

**重要性：**
- 決定應用程式運行模式
- 影響日誌輸出、錯誤處理、資料庫 SSL 連線等

---

### 3. Firebase 配置（認證用）

從你的本地 `.env` 檔案中複製以下三個值：

```bash
FIREBASE_PROJECT_ID=prediction-god

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com

# 完整的私鑰，包含 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY-----
# Railway 會自動處理 \n 換行符，不需要手動轉換
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNP3D+ssLY...
...（你的完整私鑰）...
-----END PRIVATE KEY-----
```

**注意事項：**
- ⚠️ 不要在私鑰外面加引號
- ⚠️ Railway 會自動處理換行符（`\n`），直接貼上完整私鑰即可
- ⚠️ 確保私鑰完整，包含開頭和結尾標記

---

### 4. URL 配置

```bash
# 前端 URL（用於 CORS、重定向等）
FRONTEND_URL=https://predictiongod.app

# 後端 API URL（用於 OG 標籤、圖片 URL 等）
API_URL=https://prediction-backend-production-8f6c.up.railway.app
```

**說明：**
- `FRONTEND_URL`：你的 Cloudflare Pages 主域名
- `API_URL`：你的 Railway 服務 URL（在 Railway Dashboard 的 Settings → Domains 中查看）

---

### 5. 時區設置（可選但推薦）

```bash
TZ=Asia/Taipei
```

**重要性：**
- 確保資料庫時間戳記錄正確
- 影響排程任務的執行時間

---

### 6. 調試變數（可選，用於診斷問題）

```bash
# 開啟 Admin Guard 調試日誌
DEBUG_ADMIN_GUARD=true

# 開啟所有請求日誌
DEBUG_ALL_REQUESTS=true
```

**使用時機：**
- 當 Admin 端點返回 403 時，開啟 `DEBUG_ADMIN_GUARD`
- 當 API 請求有問題時，開啟 `DEBUG_ALL_REQUESTS`
- 問題解決後，建議移除這些變數以減少日誌輸出

---

## ✅ 環境變數檢查清單

在 Railway Dashboard 中，確認以下變數已設置：

- [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- [ ] `NODE_ENV` = `production`
- [ ] `FIREBASE_PROJECT_ID` = `prediction-god`
- [ ] `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@...`
- [ ] `FIREBASE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----...`
- [ ] `FRONTEND_URL` = `https://predictiongod.app`
- [ ] `API_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
- [ ] `TZ` = `Asia/Taipei`

**總計：至少 8 個環境變數**

---

## 🔍 如何驗證環境變數設置

### 方法 1：在 Railway Dashboard 中查看

1. 前往你的服務
2. 點擊 "Variables" 標籤
3. 確認所有必需變數都存在
4. 點擊每個變數查看值是否正確

### 方法 2：查看部署日誌

1. 前往 "Deployments" 標籤
2. 點擊最新的部署
3. 查看 "Build Logs" 和 "Deploy Logs"
4. 尋找環境變數相關的錯誤訊息

### 方法 3：測試 API 端點

執行診斷腳本：
```bash
cd /Users/dannykan/Prediction-God/prediction-backend
./scripts/railway-diagnostic.sh
```

如果看到以下錯誤，表示環境變數有問題：
- `Database connection failed` → 檢查 `DATABASE_URL`
- `Firebase initialization failed` → 檢查 Firebase 三個變數
- `CORS error` → 檢查 `FRONTEND_URL`

---

## 🚨 常見問題

### Q1: DATABASE_URL 沒有自動設置

**原因：**Backend 服務沒有連接到 PostgreSQL 服務

**解決方法：**
1. 在 Railway Dashboard 中，點擊 PostgreSQL 服務
2. 點擊 "Connect" 或 "Add Variable Reference"
3. 選擇你的 Backend 服務
4. Railway 會自動添加 `DATABASE_URL` 變數

---

### Q2: Firebase 私鑰格式錯誤

**症狀：**應用程式無法啟動，日誌顯示 `Firebase initialization failed`

**解決方法：**
1. 確保私鑰包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`
2. 不要在私鑰外面加引號
3. 直接從 `.env` 檔案複製完整私鑰（包含換行符）
4. Railway 會自動處理 `\n`，不需要手動轉換

**正確格式：**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
...（完整私鑰）...
-----END PRIVATE KEY-----
```

**錯誤格式：**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQ..."  ❌ 不要加引號
```

---

### Q3: CORS 錯誤

**症狀：**前端無法呼叫 API，瀏覽器控制台顯示 CORS 錯誤

**解決方法：**
1. 確認 `FRONTEND_URL` 設置正確
2. 如果使用多個域名，添加 `ALLOWED_ORIGINS` 變數：
   ```bash
   ALLOWED_ORIGINS=https://predictiongod.app,https://www.predictiongod.app,https://predictiongod.pages.dev
   ```
3. 確保 `src/main.ts` 中的 CORS 設定為 `origin: true`

---

### Q4: Admin 端點返回 404

**症狀：**`/admin/markets` 返回 404 而非 403

**解決方法：**
1. 這通常是構建快取問題
2. 在 Railway Dashboard 中觸發 "Redeploy"
3. 如果仍有問題，檢查 `NODE_ENV` 是否設為 `production`

---

## 📝 環境變數設置步驟

### 一步一步設置

1. **登入 Railway Dashboard**
   - 前往：https://railway.app

2. **選擇你的專案**
   - 找到 prediction-god 專案

3. **選擇 Backend 服務**
   - 點擊 prediction-backend 服務

4. **進入 Variables 標籤**
   - 點擊頂部的 "Variables" 標籤

5. **添加變數**
   - 點擊 "New Variable"
   - 輸入變數名稱（例如：`NODE_ENV`）
   - 輸入變數值（例如：`production`）
   - 點擊 "Add"

6. **重複步驟 5，添加所有必需變數**

7. **觸發重新部署**
   - 添加完變數後，Railway 會自動觸發重新部署
   - 或手動點擊 "Deploy" 按鈕

8. **等待部署完成**
   - 觀察部署日誌
   - 確保沒有錯誤

9. **驗證設置**
   - 執行診斷腳本
   - 或訪問 https://prediction-backend-production-8f6c.up.railway.app/health

---

## 🔐 安全建議

1. **不要將敏感變數提交到 Git**
   - `.env` 檔案已在 `.gitignore` 中
   - 永遠不要提交包含真實私鑰的檔案

2. **定期更換 Firebase 私鑰**
   - 建議每 6-12 個月更換一次

3. **使用 Railway 的環境變數管理**
   - 不要在程式碼中硬編碼敏感資訊
   - 使用 `process.env.VARIABLE_NAME` 讀取

4. **備份環境變數**
   - 將變數列表保存到安全的地方
   - 但不要保存實際的私鑰值

---

## 📊 完成後的驗證

設置完成後，執行以下檢查：

```bash
# 1. 健康檢查
curl https://prediction-backend-production-8f6c.up.railway.app/health
# 預期：返回 200 OK

# 2. 公開端點
curl https://prediction-backend-production-8f6c.up.railway.app/markets
# 預期：返回 200 和市場資料

# 3. Admin 端點（不帶 header）
curl -I https://prediction-backend-production-8f6c.up.railway.app/admin/markets
# 預期：返回 403 Forbidden（而非 404）

# 4. Admin 端點（帶 header）
curl -H "X-Admin-Authenticated: true" \
  https://prediction-backend-production-8f6c.up.railway.app/admin/markets
# 預期：返回 200 和市場資料

# 5. 執行完整診斷
cd prediction-backend
./scripts/railway-diagnostic.sh
```

如果所有檢查都通過，表示環境變數設置成功！

---

需要協助？請提供：
1. Railway 部署日誌
2. 診斷腳本輸出
3. 具體的錯誤訊息
