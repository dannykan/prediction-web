# ⚠️ Railway 環境變數緊急檢查

## 🚨 當前狀況

**部署已完成，但 Admin 端點仍返回 404**

這表示問題很可能是 **Railway 環境變數缺失或配置錯誤**。

---

## 🔍 立即檢查步驟

### **步驟 1：前往 Railway Dashboard**

1. 打開瀏覽器，前往：https://railway.app
2. 登入你的帳號
3. 選擇你的專案（prediction-god 或類似名稱）
4. 點擊 **prediction-backend** 服務
5. 點擊頂部的 **"Variables"** 標籤

---

### **步驟 2：確認以下 8 個必需環境變數**

請逐一檢查每個變數是否存在，並且值正確：

#### ✅ 1. DATABASE_URL
```
變數名：DATABASE_URL
變數值：${{Postgres.DATABASE_URL}}
```
**說明：** Railway 自動注入，連接 PostgreSQL 服務

**如果缺失：**
1. 確認你已添加 PostgreSQL 服務
2. 點擊 "New Variable"
3. 選擇 "Reference" → 選擇 PostgreSQL 的 DATABASE_URL

---

#### ✅ 2. NODE_ENV
```
變數名：NODE_ENV
變數值：production
```
**說明：** 決定應用程式運行模式

**如果缺失：**
1. 點擊 "New Variable"
2. 變數名：`NODE_ENV`
3. 變數值：`production`

---

#### ✅ 3. FIREBASE_PROJECT_ID
```
變數名：FIREBASE_PROJECT_ID
變數值：prediction-god
```

**如果缺失或錯誤：**
1. 點擊 "New Variable"（或編輯現有）
2. 變數名：`FIREBASE_PROJECT_ID`
3. 變數值：`prediction-god`

---

#### ✅ 4. FIREBASE_CLIENT_EMAIL
```
變數名：FIREBASE_CLIENT_EMAIL
變數值：firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com
```

**如果缺失或錯誤：**
1. 點擊 "New Variable"
2. 變數名：`FIREBASE_CLIENT_EMAIL`
3. 變數值：`firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com`

---

#### ✅ 5. FIREBASE_PRIVATE_KEY（最關鍵！）
```
變數名：FIREBASE_PRIVATE_KEY
變數值：-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNP3D+ssLY...
...（完整私鑰）...
-----END PRIVATE KEY-----
```

**⚠️ 重要注意事項：**
- ❌ 不要在私鑰外面加引號
- ❌ 不要手動轉換 `\n` 為換行符（Railway 會自動處理）
- ✅ 直接複製整個私鑰，包含開頭和結尾標記

**如何取得完整私鑰：**
從你的本地 `/Users/dannykan/Prediction-God/prediction-backend/.env` 檔案中複製 `FIREBASE_PRIVATE_KEY` 的值

**如果缺失或錯誤：**
1. 點擊 "New Variable"
2. 變數名：`FIREBASE_PRIVATE_KEY`
3. 變數值：貼上完整私鑰（包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
4. 不要加引號！

---

#### ✅ 6. FRONTEND_URL
```
變數名：FRONTEND_URL
變數值：https://predictiongod.app
```

**如果缺失：**
1. 點擊 "New Variable"
2. 變數名：`FRONTEND_URL`
3. 變數值：`https://predictiongod.app`

---

#### ✅ 7. API_URL
```
變數名：API_URL
變數值：https://prediction-backend-production-8f6c.up.railway.app
```

**如何確認正確的 API URL：**
1. 在 Railway Dashboard 中
2. 點擊 prediction-backend 服務
3. 點擊 "Settings" 標籤
4. 查看 "Domains" 部分，複製 Railway 提供的 URL

**如果缺失：**
1. 點擊 "New Variable"
2. 變數名：`API_URL`
3. 變數值：貼上你的 Railway URL

---

#### ✅ 8. TZ
```
變數名：TZ
變數值：Asia/Taipei
```

**如果缺失：**
1. 點擊 "New Variable"
2. 變數名：`TZ`
3. 變數值：`Asia/Taipei`

---

## 🔄 步驟 3：觸發重新部署

添加或修改環境變數後：

### **選項 A：Railway 自動重新部署**
- Railway 通常會自動檢測到環境變數變更並重新部署
- 等待 2-3 分鐘

### **選項 B：手動觸發部署**
1. 點擊 "Deployments" 標籤
2. 點擊最新部署的 "⋯" 按鈕
3. 選擇 "Redeploy"
4. 等待部署完成

---

## 📊 步驟 4：驗證修復

部署完成後，在你的電腦上執行：

```bash
cd /Users/dannykan/Prediction-God/prediction-backend
./scripts/railway-diagnostic.sh
```

**預期結果：**
```
✅ Admin 端點正常 (HTTP 200 或 403)  ← 不再是 404
```

---

## 🚨 常見問題

### Q1: 我找不到 "Variables" 標籤
**A:** 確認你點擊的是服務本身，而不是專案首頁。路徑應該是：
```
Railway Dashboard → 你的專案 → prediction-backend 服務 → Variables 標籤
```

---

### Q2: 我不確定 FIREBASE_PRIVATE_KEY 的格式
**A:** 正確格式應該是：
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...（一長串字符）...
-----END PRIVATE KEY-----
```

**錯誤格式：**
```
"-----BEGIN PRIVATE KEY-----\nMIIE..."  ❌ 不要加引號
```

從本地 `.env` 檔案複製時，確保複製了完整的值（包含換行符）。

---

### Q3: 添加變數後多久會生效？
**A:**
- Railway 檢測到變數變更：立即
- 觸發重新部署：30 秒內
- 完成部署：2-3 分鐘
- **總計：約 3-4 分鐘**

---

### Q4: 我已經設置了所有變數，但仍然 404
**A:** 可能的原因：
1. **Firebase 私鑰格式錯誤** - 最常見
   - 確認沒有加引號
   - 確認包含開頭和結尾標記
   - 嘗試重新複製貼上

2. **NODE_ENV 不是 production**
   - 確認值是 `production`（全小寫）

3. **部署日誌有錯誤**
   - Railway Dashboard → Deployments → 最新部署 → View Logs
   - 查看是否有 Firebase 初始化錯誤

---

## 📋 環境變數檢查清單

在 Railway Dashboard → Variables 中，確認以下內容：

```
□ DATABASE_URL = ${{Postgres.DATABASE_URL}}
□ NODE_ENV = production
□ FIREBASE_PROJECT_ID = prediction-god
□ FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@...
□ FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----...（完整私鑰，無引號）
□ FRONTEND_URL = https://predictiongod.app
□ API_URL = https://prediction-backend-production-8f6c.up.railway.app
□ TZ = Asia/Taipei
```

**總計：8 個環境變數**

---

## 🎯 下一步

1. ✅ 檢查並添加所有 8 個環境變數
2. ✅ 等待 3-4 分鐘讓 Railway 重新部署
3. ✅ 執行 `./scripts/railway-diagnostic.sh` 驗證
4. ✅ 測試前端功能（創建市場、下注、Admin 管理）

---

## 📞 仍需協助？

如果檢查環境變數並重新部署後仍有問題，請提供：

1. **Railway Variables 截圖**（遮蔽 FIREBASE_PRIVATE_KEY 的值）
2. **Railway 部署日誌**（Deployments → View Logs）
3. **診斷腳本輸出**

我會進一步協助診斷！
