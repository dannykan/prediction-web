# Railway 部署問題修復指南

## 🔍 問題診斷結果

經過診斷，發現以下問題：

### ✅ 正常運作的部分
1. ✅ Railway 部署成功
2. ✅ 健康檢查端點正常 (`/health`)
3. ✅ 資料庫連線正常
4. ✅ 公開 API 端點正常 (`GET /markets`)
5. ✅ 認證機制正常（正確返回 401）
6. ✅ CORS 設定正常（支援 Cloudflare 域名）

### ❌ 發現的問題
1. ❌ **Admin 路由返回 404**
   - `GET /admin/markets` → 404
   - `GET /admin/users` → 404
   - 本地編譯正常，`AdminMarketsController` 已正確編譯
   - 模組配置正確

### 🎯 根本原因
**Railway 可能使用了舊版本的構建快取**，導致 Admin controllers 沒有正確部署。

---

## 🛠️ 修復步驟

### 方案 1：強制 Railway 重新構建（推薦）

1. **登入 Railway Dashboard**
   - 前往：https://railway.app

2. **選擇你的專案**
   - 找到 `prediction-backend-production` 服務

3. **觸發重新部署**
   - 方法 A：在 Deployments 標籤中，點擊最新部署的 "⋯" 選單
   - 選擇 **"Redeploy"**（重新部署）
   - 或選擇 **"Redeploy from source"**（從原始碼重新部署）

4. **等待部署完成**
   - 觀察構建日誌，確保沒有錯誤
   - 等待服務啟動（約 1-2 分鐘）

5. **驗證修復**
   - 執行診斷腳本：
     ```bash
     cd /Users/dannykan/Prediction-God/prediction-backend
     ./scripts/railway-diagnostic.sh
     ```
   - 確認 Admin 端點返回 200 或 403（而非 404）

---

### 方案 2：清除構建快取並重新部署

1. **在 Railway Dashboard 中**
   - 前往你的服務設定
   - 點擊 "Settings" 標籤

2. **清除快取**
   - 尋找 "Build Cache" 或類似選項
   - 點擊 "Clear Build Cache"

3. **觸發新的部署**
   - 可以通過推送一個小改動到 Git
   - 或使用 Railway CLI：
     ```bash
     railway up --service prediction-backend
     ```

---

### 方案 3：檢查 Railway 環境變數（如果重新部署後仍有問題）

請確認以下環境變數已在 Railway Dashboard 中設置：

#### 必需的環境變數
```bash
# 資料庫（Railway 自動注入）
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node 環境
NODE_ENV=production

# Firebase 配置（從你的 .env 複製）
FIREBASE_PROJECT_ID=prediction-god
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<完整的私鑰，包含 -----BEGIN PRIVATE KEY----- 等>

# 前端 URL（CORS 用）
FRONTEND_URL=https://predictiongod.app

# 後端 URL
API_URL=https://prediction-backend-production-8f6c.up.railway.app

# 時區
TZ=Asia/Taipei
```

#### 可選的調試變數
```bash
# 開啟 Admin Guard 調試日誌
DEBUG_ADMIN_GUARD=true
```

---

### 方案 4：更新 CORS 設定以明確列出允許的域名（如果需要）

如果重新部署後，前端仍然無法呼叫 API，可以更新 CORS 設定：

#### 在 Railway Dashboard 中添加環境變數：
```bash
ALLOWED_ORIGINS=https://predictiongod.app,https://www.predictiongod.app,https://predictiongod.pages.dev
```

#### 然後修改 `src/main.ts` 的 CORS 配置：

```typescript
// 從環境變數讀取允許的來源
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://predictiongod.app',
  'https://www.predictiongod.app',
  'https://predictiongod.pages.dev',
];

app.enableCors({
  origin: (origin, callback) => {
    // 允許沒有 origin 的請求（例如 Postman）
    if (!origin) return callback(null, true);

    // 允許列表中的域名
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // 開發環境允許所有來源
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'Origin',
    'Referer',
    'X-Admin-Authenticated',
    'x-admin-authenticated',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
});
```

---

## 🧪 驗證修復

### 1. 執行診斷腳本
```bash
cd /Users/dannykan/Prediction-God/prediction-backend
./scripts/railway-diagnostic.sh
```

### 2. 手動測試 Admin 端點
```bash
# 應該返回 403（需要認證）而非 404
curl -I https://prediction-backend-production-8f6c.up.railway.app/admin/markets

# 帶 header 應該返回 200 或資料
curl -H "X-Admin-Authenticated: true" \
  https://prediction-backend-production-8f6c.up.railway.app/admin/markets
```

### 3. 測試前端功能
- 在瀏覽器中訪問 `https://predictiongod.app`
- 嘗試創建市場
- 嘗試下注
- 檢查瀏覽器控制台（F12）是否有錯誤

---

## 📊 預期結果

修復後，診斷腳本應該顯示：

```
5️⃣ 測試 Admin 端點...
   5a. 不帶 header（應該失敗）...
   ✅ 正確拒絕無 header 的請求 (HTTP 403)

   5b. 帶 X-Admin-Authenticated header（應該成功或返回資料）...
   ✅ Admin 端點正常 (HTTP 200)
```

---

## 🆘 如果仍有問題

### 檢查 Railway 部署日誌
1. 在 Railway Dashboard 中
2. 點擊 "Deployments" 標籤
3. 查看最新部署的日誌
4. 尋找錯誤訊息或警告

### 常見錯誤和解決方案

#### 錯誤：Module not found
- **原因**：依賴未正確安裝
- **解決**：確認 `package.json` 中的依賴完整，重新部署

#### 錯誤：Database connection failed
- **原因**：`DATABASE_URL` 未設置或格式錯誤
- **解決**：檢查 Railway 環境變數，確保 PostgreSQL 服務已連接

#### 錯誤：Firebase initialization failed
- **原因**：Firebase 環境變數缺失或格式錯誤
- **解決**：
  1. 檢查 `FIREBASE_PRIVATE_KEY` 是否包含完整的私鑰
  2. 確保私鑰中的 `\n` 正確處理（Railway 會自動處理）
  3. 不要在私鑰外加引號

---

## 📝 部署檢查清單

在每次部署後，請檢查：

- [ ] 部署成功（綠色勾選）
- [ ] 健康檢查通過
- [ ] 環境變數正確設置（至少 7 個必需變數）
- [ ] Admin 端點返回 403 而非 404
- [ ] 公開端點正常運作
- [ ] CORS 設定允許 Cloudflare 域名
- [ ] 前端可以正常呼叫 API

---

## 🚀 快速修復命令

如果你想快速測試修復，可以執行：

```bash
# 1. 執行診斷
./scripts/railway-diagnostic.sh

# 2. 如果 Admin 端點返回 404，在 Railway Dashboard 中重新部署

# 3. 等待 2 分鐘後再次執行診斷
./scripts/railway-diagnostic.sh

# 4. 如果仍有問題，檢查環境變數
echo "請檢查 Railway Dashboard 中的環境變數是否完整"
```

---

## 💡 建議

1. **監控部署**：在 Railway Dashboard 中設置部署通知
2. **版本控制**：每次修改後提交 Git，方便回滾
3. **環境變數備份**：將 Railway 環境變數備份到 `.env.railway.example`
4. **定期測試**：使用診斷腳本定期檢查 API 健康狀態

---

如果執行上述步驟後仍有問題，請提供：
1. Railway 部署日誌
2. 診斷腳本的完整輸出
3. 瀏覽器控制台的錯誤訊息

我會進一步協助診斷！
