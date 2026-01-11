# Railway 後端部署 - 立即開始

## 🎯 目標

將 `prediction-backend` 部署到 Railway，讓前端可以連接後端 API。

## 📋 部署步驟

### 步驟 1: 創建 Railway 專案並連接 GitHub

1. **訪問 Railway Dashboard**
   - https://railway.app
   - 登入你的帳號

2. **創建新專案**
   - 點擊 **"New Project"**
   - 選擇 **"Deploy from GitHub repo"**
   - 選擇 `dannykan/prediction-web` 倉庫
   - Railway 會自動檢測到 `prediction-backend` 目錄

3. **確認服務設置**
   - 確認服務名稱是 `prediction-backend` 或類似
   - 確認 **Root Directory** 為 `prediction-backend`（如果沒有自動檢測）

### 步驟 2: 添加 PostgreSQL 資料庫

1. **在 Railway 專案中**
   - 點擊 **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway 會自動創建 PostgreSQL 服務

2. **自動設置**
   - Railway 會自動設置 `DATABASE_URL` 環境變數
   - 不需要手動配置

### 步驟 3: 設置環境變數

在 Railway 服務的 **Variables** 標籤中，添加以下環境變數：

#### 必需環境變數：

```bash
# 核心配置
NODE_ENV=production
TZ=Asia/Taipei

# Firebase 配置（從本地 .env 複製）
FIREBASE_PROJECT_ID=prediction-god
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[你的完整私鑰]
-----END PRIVATE KEY-----

# URL 配置（部署完成後更新）
FRONTEND_URL=https://predictiongod.app
API_URL=https://prediction-backend-production-8f6c.up.railway.app
```

**重要**：
- `FIREBASE_PRIVATE_KEY` 直接貼上完整私鑰（包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
- Railway 會自動處理換行符，不需要手動轉換
- `API_URL` 需要等部署完成後，從 Railway Dashboard 獲取實際域名並更新

### 步驟 4: 設置啟動命令

1. **在 Railway 服務設置中**
   - 進入 **Settings** → **Deploy**
   - 確認 **Start Command** 為：
     ```bash
     npm run start:prod
     ```

2. **確認其他設置**
   - **Root Directory**: `prediction-backend`
   - **Build Command**: 留空（或 `npm install`，Railway 會自動執行）

### 步驟 5: 等待部署完成

1. **查看部署日誌**
   - Railway Dashboard → 你的服務 → **Deployments**
   - 等待部署完成（約 3-5 分鐘）
   - 確認部署狀態為 ✅ Success

2. **檢查日誌**
   - Railway Dashboard → 你的服務 → **Logs**
   - 確認：
     - ✅ Migration 執行成功
     - ✅ 服務正常啟動
     - ✅ 沒有錯誤訊息

### 步驟 6: 獲取後端 URL 並更新環境變數

1. **獲取公開域名**
   - Railway Dashboard → 你的服務 → **Settings** → **Domains**
   - 複製公開域名（例如：`https://prediction-backend-production-8f6c.up.railway.app`）

2. **更新環境變數**
   - 在 **Variables** 標籤中
   - 更新 `API_URL` 為實際的 Railway 域名
   - 如果還沒有設置，添加 `API_URL` 環境變數

### 步驟 7: 驗證部署

1. **健康檢查**
   ```bash
   curl https://prediction-backend-production-8f6c.up.railway.app/health
   ```
   應該返回：`{"status":"ok"}`

2. **檢查 API**
   ```bash
   curl https://prediction-backend-production-8f6c.up.railway.app/api/health
   ```

---

## ✅ 完成檢查清單

- [ ] Railway 專案已創建
- [ ] GitHub 倉庫已連接
- [ ] PostgreSQL 資料庫已添加
- [ ] 環境變數已設置（包括 Firebase 配置）
- [ ] 啟動命令已設置
- [ ] 部署成功
- [ ] Migration 執行成功
- [ ] 健康檢查通過
- [ ] 後端 URL 已獲取並更新到環境變數

---

## 🔧 如果遇到問題

### Migration 失敗

**檢查**：
- Railway 日誌中的錯誤訊息
- 確認 `DATABASE_URL` 正確設置
- 確認資料庫連接正常

**解決**：
- 檢查環境變數
- 確認 migration 文件存在
- 查看 Railway 日誌

### 服務無法啟動

**檢查**：
- Railway 日誌中的錯誤訊息
- 確認環境變數已設置
- 確認 `package.json` 中的腳本正確

**解決**：
- 檢查啟動命令是否正確
- 確認所有依賴都已安裝
- 查看 Railway 日誌

### API 連接失敗

**檢查**：
- 確認 Railway 公開域名已設置
- 檢查 CORS 配置
- 確認 `FRONTEND_URL` 環境變數正確

**解決**：
- 更新環境變數
- 檢查後端 CORS 配置
- 確認前端環境變數正確

---

## 🎉 完成後

後端部署完成後，記下後端 URL，然後：
1. 更新 GitHub Secrets 中的 `NEXT_PUBLIC_API_BASE_URL`
2. 觸發前端部署

詳見：`DEPLOYMENT_STEPS_NOW.md`
