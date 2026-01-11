# 部署指南：用 prediction-web 覆蓋 prediction-app

## 🎯 目標

用 Next.js 版本的 `prediction-web` 完全替換現有的 Flutter 版本 `prediction-app`。

## 📋 前置準備

### 1. 確認 GitHub 倉庫

目前 `prediction-web` 還沒有獨立的 GitHub 倉庫。你有兩個選擇：

#### 選項 A: 在同一個倉庫中（推薦）

如果 `prediction-app` 已經在 GitHub 上，可以在同一個倉庫中添加 `prediction-web`：

- 倉庫結構：
  ```
  prediction-app/
  prediction-web/
  prediction-backend/
  ```

#### 選項 B: 創建新倉庫

如果希望 `prediction-web` 有獨立的倉庫，需要創建新的 GitHub 倉庫。

### 2. 初始化 Git（如果還沒有）

```bash
cd /Users/dannykan/Prediction-God

# 檢查是否已經是 git 倉庫
git status

# 如果不是，初始化
git init
git add .
git commit -m "Initial commit: Prediction God web and backend"
```

---

## 🚀 部署步驟

### 步驟 1: 推送到 GitHub

#### 如果使用選項 A（同一個倉庫）

```bash
cd /Users/dannykan/Prediction-God

# 檢查當前遠程倉庫
git remote -v

# 如果已經有遠程倉庫，直接推送
git add .
git commit -m "Add prediction-web: Next.js version to replace Flutter web"
git push origin main

# 如果還沒有遠程倉庫，先添加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 如果使用選項 B（新倉庫）

1. 在 GitHub 創建新倉庫（例如：`prediction-god-web`）
2. 不要初始化 README、.gitignore 或 license
3. 執行：

```bash
cd /Users/dannykan/Prediction-God

git init
git add .
git commit -m "Initial commit: Prediction God web and backend"
git remote add origin https://github.com/YOUR_USERNAME/prediction-god-web.git
git branch -M main
git push -u origin main
```

### 步驟 2: 更新 Cloudflare Pages 配置

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Pages → 找到 `predictiongod` 專案

2. **更新構建設置**
   - Settings → Builds & deployments
   - 更新以下設置：
     - **Root directory**: `/prediction-web`
     - **Build command**: `cd prediction-web && npm install && npm run build`
     - **Build output directory**: `prediction-web/.next`
     - **Framework preset**: `Next.js`（如果還沒設置）

3. **更新環境變數**
   - Settings → Environment variables
   - 更新或添加：
     ```
     NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
     NEXT_PUBLIC_SITE_URL=https://predictiongod.app
     ```

4. **觸發重新部署**
   - 可以手動觸發：Deployments → Create deployment
   - 或推送代碼到 GitHub，Cloudflare 會自動部署

### 步驟 3: 配置 Railway（後端）

如果後端還沒有部署到 Railway：

1. **訪問 Railway Dashboard**
   - https://railway.app

2. **創建新專案**
   - New Project → Deploy from GitHub repo
   - 選擇你的 GitHub 倉庫
   - Root Directory: `prediction-backend`

3. **設置環境變數**
   ```
   FRONTEND_URL=https://predictiongod.app
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=<Railway 會自動設置>
   ```

4. **添加 PostgreSQL 資料庫**
   - New → Database → Add PostgreSQL
   - Railway 會自動設置 `DATABASE_URL`

---

## ✅ 驗證部署

### 1. 檢查前端

```bash
# 訪問網站
curl https://predictiongod.app

# 檢查頁面是否正常載入
# 應該看到 Next.js 版本的頁面，而不是 Flutter 版本
```

### 2. 檢查後端

```bash
# 健康檢查
curl https://prediction-backend-production-8f6c.up.railway.app/health
```

### 3. 測試功能

- [ ] 首頁載入正常
- [ ] 市場列表顯示
- [ ] 登入功能正常
- [ ] 關注功能正常
- [ ] 邀請功能正常

---

## 🔄 停止 Flutter 自動部署（可選）

如果你不再需要 Flutter 版本的自動部署：

1. **在 GitHub 中**
   - Settings → Actions → General
   - 找到 `prediction-app/.github/workflows/deploy-cloudflare.yml`
   - 可以禁用這個 workflow（在 workflow 文件中添加 `workflow_dispatch:` 並移除 `push:` 觸發器）

2. **或在 Cloudflare 中**
   - 可以保留舊專案，但不再觸發部署
   - 或直接刪除舊的構建配置

---

## ⚠️ 注意事項

1. **資料庫 Migration**
   - Railway 會在啟動時自動執行 migration
   - 確認所有 migration 文件都已提交

2. **環境變數**
   - 確保所有必要的環境變數都已設置
   - 特別注意 `NEXT_PUBLIC_*` 變數需要重新部署才能生效

3. **DNS 和域名**
   - `predictiongod.app` 域名應該繼續指向 Cloudflare Pages
   - 不需要更改 DNS 設置

4. **緩存清除**
   - 部署後可能需要清除 Cloudflare 緩存
   - 或等待幾分鐘讓緩存自動更新

---

## 📝 後續維護

### 更新代碼

```bash
# 1. 修改代碼
# 2. 提交更改
git add .
git commit -m "描述你的更改"
git push origin main

# 3. Cloudflare Pages 會自動部署
```

### 查看部署狀態

- **Cloudflare Pages**: Dashboard → Pages → predictiongod → Deployments
- **Railway**: Dashboard → 你的服務 → Deployments

---

## 🎉 完成！

部署完成後，`https://predictiongod.app` 應該顯示 Next.js 版本的網站，完全替換了 Flutter 版本。

如有任何問題，請檢查日誌或參考 `DEPLOYMENT_CHECKLIST.md`。
