# 部署指南 - GitHub → Cloudflare Pages & Railway

## 📋 前置準備

### 1. 初始化 Git 倉庫（如果還沒有）

```bash
cd /Users/dannykan/Prediction-God

# 初始化 git 倉庫
git init

# 添加所有文件
git add .

# 創建初始提交
git commit -m "Initial commit: Prediction God web and backend"

# 添加遠程倉庫（替換為你的 GitHub 倉庫 URL）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 2. 創建 GitHub 倉庫

如果還沒有 GitHub 倉庫：
1. 訪問 https://github.com/new
2. 創建新倉庫（例如：`prediction-god`）
3. 不要初始化 README、.gitignore 或 license（因為我們已經有這些文件）
4. 複製倉庫 URL

---

## 🚀 部署步驟

### 步驟 1: 提交代碼到 GitHub

```bash
cd /Users/dannykan/Prediction-God

# 檢查狀態
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "準備部署：更新前後端配置和功能"

# 推送到 GitHub
git push origin main
```

### 步驟 2: 配置 Cloudflare Pages（前端）

#### 2.1 連接 GitHub 倉庫

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 進入 **Pages** → **Create a project**
3. 選擇 **Connect to Git**
4. 選擇你的 GitHub 倉庫
5. 配置構建設置：
   - **Project name**: `predictiongod`（覆蓋現有的 Flutter 版本）
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `cd prediction-web && npm install && npm run build`
   - **Build output directory**: `prediction-web/.next`
   - **Root directory**: `/prediction-web`

#### 2.2 設置環境變數

在 Cloudflare Pages 專案設置中：

1. 進入 **Settings** → **Environment variables**
2. 添加以下環境變數（Production）：

```bash
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.app
```

3. 點擊 **Save**

#### 2.3 自定義域名（可選）

1. 進入 **Custom domains**
2. 添加 `predictiongod.app`
3. 按照指示更新 DNS 記錄

### 步驟 3: 配置 Railway（後端）

#### 3.1 連接 GitHub 倉庫

1. 登入 [Railway Dashboard](https://railway.app)
2. 點擊 **New Project**
3. 選擇 **Deploy from GitHub repo**
4. 選擇你的 GitHub 倉庫
5. 選擇 `prediction-backend` 目錄作為服務根目錄

#### 3.2 設置環境變數

在 Railway 服務設置中：

1. 進入 **Variables** 標籤
2. 添加以下環境變數：

```bash
FRONTEND_URL=https://predictiongod.app
NODE_ENV=production
PORT=5001
```

3. **DATABASE_URL** 應該由 Railway 自動設置（如果已連接 PostgreSQL 服務）

#### 3.3 連接 PostgreSQL 資料庫

1. 在 Railway 專案中，點擊 **New** → **Database** → **Add PostgreSQL**
2. 這會自動創建 PostgreSQL 服務並設置 `DATABASE_URL` 環境變數
3. Railway 會自動執行 migration（在啟動時）

#### 3.4 設置啟動命令

在 Railway 服務設置中：

1. 進入 **Settings** → **Deploy**
2. 確認 **Start Command** 為：
   ```bash
   npm run start:prod
   ```

---

## 🔄 自動部署配置

### Cloudflare Pages 自動部署

Cloudflare Pages 會在以下情況自動部署：
- 推送到 `main` 分支
- 創建 Pull Request（預覽部署）

### Railway 自動部署

Railway 會在以下情況自動部署：
- 推送到連接的分支
- 手動觸發部署

---

## ✅ 部署後驗證

### 1. 檢查前端部署

```bash
# 訪問你的網站
curl https://predictiongod.app

# 或訪問 Cloudflare Pages 預覽 URL
# https://predictiongod.pages.dev
```

### 2. 檢查後端部署

```bash
# 檢查健康檢查端點
curl https://prediction-backend-production-8f6c.up.railway.app/health
```

### 3. 測試功能

1. 訪問前端網站
2. 測試登入功能
3. 測試市場列表
4. 測試關注功能
5. 測試邀請功能

---

## 🐛 故障排查

### 問題 1: Cloudflare Pages 構建失敗

**檢查**：
- 構建日誌中的錯誤訊息
- 確認 `package.json` 中的構建腳本正確
- 確認 Node.js 版本（建議 18+）

**解決**：
- 檢查構建命令是否正確
- 確認所有依賴都已安裝

### 問題 2: Railway 部署失敗

**檢查**：
- Railway 日誌中的錯誤訊息
- 確認環境變數已設置
- 確認資料庫連接正常

**解決**：
- 檢查 migration 是否執行成功
- 確認 `DATABASE_URL` 正確

### 問題 3: API 連接失敗

**檢查**：
- 前端環境變數 `NEXT_PUBLIC_API_BASE_URL` 是否正確
- 後端 CORS 配置是否允許前端域名
- 後端是否正常運行

**解決**：
- 確認環境變數已設置並重新部署
- 檢查後端 CORS 配置

---

## 📝 後續維護

### 更新代碼

```bash
# 1. 修改代碼
# 2. 提交更改
git add .
git commit -m "描述你的更改"
git push origin main

# 3. Cloudflare 和 Railway 會自動部署
```

### 查看部署狀態

- **Cloudflare Pages**: Dashboard → Pages → 你的專案 → Deployments
- **Railway**: Dashboard → 你的服務 → Deployments

---

## 🎉 完成！

部署完成後，你的應用應該可以通過以下 URL 訪問：

- **前端**: https://predictiongod.app
- **後端 API**: https://prediction-backend-production-8f6c.up.railway.app

如有任何問題，請檢查日誌或參考 `DEPLOYMENT_CHECKLIST.md`。
