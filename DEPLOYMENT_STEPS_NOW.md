# 現在開始部署 - 完整步驟

## ✅ 已完成

- ✅ GitHub Secrets 已設置（`CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`）
- ✅ 代碼已推送到 GitHub

## 🚀 部署順序

### 第一步：部署後端到 Railway（先做這個）

後端需要先部署，因為前端需要連接後端 API。

### 第二步：部署前端到 Cloudflare Pages（後端部署完成後）

前端會自動通過 GitHub Actions 部署。

---

## 📋 第一步：部署後端到 Railway

### 步驟 1: 創建 Railway 專案

1. **訪問 Railway Dashboard**
   - https://railway.app
   - 登入你的帳號

2. **創建新專案**
   - 點擊 **"New Project"**
   - 選擇 **"Deploy from GitHub repo"**
   - 選擇 `dannykan/prediction-web` 倉庫
   - Railway 會自動檢測到 `prediction-backend` 目錄

3. **設置根目錄**（如果需要）
   - 在服務設置中，確認 **Root Directory** 為 `prediction-backend`
   - 或 Railway 自動檢測到

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
[你的完整私鑰，包含換行符]
-----END PRIVATE KEY-----

# URL 配置
FRONTEND_URL=https://predictiongod.app
API_URL=https://prediction-backend-production-8f6c.up.railway.app
```

**注意**：
- `DATABASE_URL` 會由 Railway 自動設置（連接 PostgreSQL 後）
- `API_URL` 需要等部署完成後，從 Railway Dashboard 的 **Settings → Domains** 中獲取實際域名
- `FIREBASE_PRIVATE_KEY` 直接貼上完整私鑰，Railway 會自動處理換行符

### 步驟 4: 設置啟動命令

1. **在 Railway 服務設置中**
   - 進入 **Settings** → **Deploy**
   - 確認 **Start Command** 為：
     ```bash
     npm run start:prod
     ```

2. **確認 Root Directory**
   - 確認 **Root Directory** 為 `prediction-backend`

### 步驟 5: 等待部署完成

1. **查看部署日誌**
   - Railway Dashboard → 你的服務 → **Deployments**
   - 確認部署狀態為 ✅ Success

2. **檢查日誌**
   - Railway Dashboard → 你的服務 → **Logs**
   - 確認：
     - ✅ Migration 執行成功
     - ✅ 服務正常啟動
     - ✅ 沒有錯誤訊息

3. **獲取後端 URL**
   - Railway Dashboard → 你的服務 → **Settings** → **Domains**
   - 複製公開域名（例如：`https://prediction-backend-production-8f6c.up.railway.app`）
   - 更新 `API_URL` 環境變數（如果與預設不同）

### 步驟 6: 驗證後端部署

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

## 📋 第二步：部署前端到 Cloudflare Pages

### 步驟 1: 確認 GitHub Secrets 已設置

✅ 你已經完成了！

### 步驟 2: 更新前端環境變數（如果需要）

如果後端 URL 與預設不同，需要在 GitHub Secrets 中更新：

1. **訪問 GitHub Secrets**
   - https://github.com/dannykan/prediction-web/settings/secrets/actions

2. **更新或添加**：
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`（使用實際的 Railway URL）
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

### 步驟 3: 觸發前端部署

有兩種方式：

#### 方式 A: 推送代碼（推薦）

```bash
cd /Users/dannykan/Prediction-God
git add .
git commit -m "trigger: Deploy frontend to Cloudflare Pages"
git push origin main
```

#### 方式 B: 手動觸發 GitHub Actions

1. 訪問：https://github.com/dannykan/prediction-web/actions
2. 選擇 **"Deploy to Cloudflare Pages"** workflow
3. 點擊 **"Run workflow"** → **"Run workflow"**

### 步驟 4: 檢查部署狀態

1. **GitHub Actions**
   - https://github.com/dannykan/prediction-web/actions
   - 確認 workflow 運行成功 ✅

2. **Cloudflare Pages**
   - https://dash.cloudflare.com
   - Pages → predictiongod → Deployments
   - 確認最新部署成功 ✅

3. **訪問網站**
   - https://predictiongod.app
   - 確認網站正常運行

---

## ✅ 部署完成檢查清單

### 後端（Railway）
- [ ] Railway 專案已創建
- [ ] PostgreSQL 資料庫已添加
- [ ] 環境變數已設置（包括 Firebase 配置）
- [ ] 部署成功
- [ ] 健康檢查通過
- [ ] Migration 執行成功

### 前端（Cloudflare Pages）
- [ ] GitHub Secrets 已設置
- [ ] 環境變數已設置（`NEXT_PUBLIC_API_BASE_URL`）
- [ ] GitHub Actions 部署成功
- [ ] Cloudflare Pages 部署成功
- [ ] 網站可以正常訪問

---

## 🔧 如果遇到問題

### 後端問題

1. **Migration 失敗**
   - 檢查 Railway 日誌
   - 確認 `DATABASE_URL` 正確設置
   - 確認資料庫連接正常

2. **服務無法啟動**
   - 檢查環境變數是否完整
   - 檢查啟動命令是否正確
   - 查看 Railway 日誌中的錯誤訊息

3. **API 無法訪問**
   - 確認 Railway 公開域名已設置
   - 檢查 CORS 配置
   - 確認 `FRONTEND_URL` 環境變數正確

### 前端問題

1. **GitHub Actions 失敗**
   - 檢查 Secrets 是否正確設置
   - 查看 GitHub Actions 日誌
   - 確認 workflow 文件正確

2. **網站無法訪問**
   - 檢查 Cloudflare Pages 部署狀態
   - 確認自定義域名設置正確
   - 檢查瀏覽器控制台錯誤

3. **API 連接失敗**
   - 確認 `NEXT_PUBLIC_API_BASE_URL` 正確
   - 檢查後端是否正常運行
   - 檢查 CORS 配置

---

## 🎉 完成後

部署完成後，你的應用將在：
- **前端**: https://predictiongod.app
- **後端**: https://prediction-backend-production-8f6c.up.railway.app

以後更新代碼時，只需：
```bash
git add .
git commit -m "你的更改描述"
git push origin main
```

Railway 和 GitHub Actions 會自動部署！
