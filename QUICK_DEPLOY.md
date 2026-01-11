# 快速部署命令

## 🚀 一鍵部署腳本

### 1. 提交到 GitHub

```bash
cd /Users/dannykan/Prediction-God

# 檢查狀態
git status

# 添加所有更改
git add .

# 提交
git commit -m "部署準備：更新前後端配置"

# 推送到 GitHub（如果已設置遠程倉庫）
git push origin main
```

### 2. Cloudflare Pages 部署

#### 方式 A: 通過 Cloudflare Dashboard（推薦）

1. 訪問 https://dash.cloudflare.com
2. Pages → Create a project → Connect to Git
3. 選擇你的 GitHub 倉庫
4. 設置：
   - Framework: Next.js
   - Root directory: `/prediction-web`
   - Build command: `npm install && npm run build`
   - Build output: `.next`
5. 添加環境變數：
   - `NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL=https://predictiongod.app`

#### 方式 B: 使用 Wrangler CLI

```bash
cd prediction-web
npm install -g wrangler
wrangler login
wrangler pages deploy .next --project-name=predictiongod
```

### 3. Railway 部署

#### 方式 A: 通過 Railway Dashboard（推薦）

1. 訪問 https://railway.app
2. New Project → Deploy from GitHub repo
3. 選擇你的 GitHub 倉庫
4. 設置 Root Directory: `prediction-backend`
5. 添加環境變數：
   - `FRONTEND_URL=https://predictiongod.app`
   - `NODE_ENV=production`
   - `PORT=5001`
6. 添加 PostgreSQL 資料庫服務
7. Railway 會自動設置 `DATABASE_URL`

#### 方式 B: 使用 Railway CLI

```bash
cd prediction-backend
npm install -g @railway/cli
railway login
railway link
railway up
```

---

## 📋 環境變數檢查清單

### Cloudflare Pages 環境變數

```bash
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.app
```

### Railway 環境變數

```bash
FRONTEND_URL=https://predictiongod.app
NODE_ENV=production
PORT=5001
DATABASE_URL=<自動設置>
```

---

## ✅ 驗證部署

### 檢查前端

```bash
curl https://predictiongod.app
```

### 檢查後端

```bash
curl https://prediction-backend-production-8f6c.up.railway.app/health
```

---

## 🔧 如果遇到問題

1. **檢查日誌**：
   - Cloudflare: Dashboard → Pages → 你的專案 → Deployments → 查看日誌
   - Railway: Dashboard → 你的服務 → Deployments → 查看日誌

2. **檢查環境變數**：
   - 確認所有環境變數都已設置
   - 確認變數名稱正確（注意大小寫）

3. **重新部署**：
   - Cloudflare: 在 Deployments 中點擊 "Retry deployment"
   - Railway: 在 Deployments 中點擊 "Redeploy"
