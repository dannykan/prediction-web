# Cloudflare Pages Next.js 設置指南

## 問題
- 預覽 URL 顯示 404
- 生產域名 (`predictiongod.app`) 仍然顯示舊的 Flutter 應用

## 解決方案

對於 Next.js 16 App Router（有 API 路由和服務器組件），**推薦使用 Cloudflare Pages 原生構建**，而不是 GitHub Actions。

### 步驟 1: 在 Cloudflare Pages Dashboard 中配置構建

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - 登入你的帳號

2. **進入 Pages 專案**
   - Workers & Pages → Pages
   - 找到 `predictiongod` 專案
   - 點擊進入專案詳情

3. **設置構建配置**
   - 點擊頂部 **"Settings"** 標籤
   - 在左側選單找到 **"Builds & deployments"**
   - 點擊進入構建配置頁面

4. **配置構建設置**
   
   **生產構建配置：**
   - **Framework preset**: `Next.js`（選擇這個，不要選 "Next.js (Static HTML Export)"）
   - **Root directory (project root)**: `prediction-web`
   - **Build command**: 留空（讓 Cloudflare 自動檢測）或 `npm run build`
   - **Build output directory**: 留空（Next.js 會自動處理）或 `.next`
   - **Node version**: `20`

   **預覽構建配置：**
   - 使用相同的設置

5. **設置環境變數**
   - 在同一個設置頁面，找到 **"Environment variables"**
   - 添加以下變數（適用於 Production 和 Preview）：
     - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
     - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

6. **連接 GitHub 倉庫**
   - 在同一個設置頁面，找到 **"Source"** 或 **"GitHub"**
   - 如果還沒有連接，點擊 **"Connect to Git"**
   - 選擇 `dannykan/prediction-web` 倉庫（如果是 monorepo，確保選擇正確的倉庫）
   - 選擇分支：`main`
   - 確保根目錄設置為 `prediction-web`

### 步驟 2: 禁用 GitHub Actions 部署（可選）

如果你使用 Cloudflare Pages 原生構建，可以禁用 GitHub Actions workflow，避免衝突：

1. 在 GitHub 倉庫中：
   - Settings → Actions → General
   - 可以禁用特定的 workflow，或者
   - 保留 workflow 但確保 Cloudflare Pages 不會被 GitHub Actions 覆蓋

**注意**：如果你使用 GitHub Actions 部署，需要正確配置（見下方），但推薦使用 Cloudflare Pages 原生構建。

### 步驟 3: 觸發部署

1. **推送代碼觸發部署**
   ```bash
   git add .
   git commit -m "Update for Cloudflare Pages"
   git push origin main
   ```

2. **或手動觸發**
   - 在 Cloudflare Pages Dashboard → `predictiongod` 專案
   - 點擊 **"Retry deployment"** 或 **"Redeploy"**

### 步驟 4: 驗證部署

1. **檢查構建日誌**
   - Cloudflare Pages Dashboard → `predictiongod` → Deployments
   - 點擊最新的部署
   - 查看構建日誌，確認構建成功

2. **訪問網站**
   - 預覽 URL: `https://[hash].predictiongod.pages.dev`
   - 生產 URL: `https://predictiongod.app`

3. **確認內容**
   - 訪問 `https://predictiongod.app`
   - 確認顯示的是新的 Next.js 應用，而不是舊的 Flutter 應用

---

## 如果必須使用 GitHub Actions（不推薦）

如果你必須使用 GitHub Actions 部署，需要：

1. 安裝適配器：`npm install --save-dev @opennextjs/cloudflare`
2. 更新 `next.config.ts` 使用適配器
3. 構建輸出到正確的目錄
4. 部署該目錄

但這更複雜，推薦使用 Cloudflare Pages 原生構建。

---

## 如果生產域名仍然顯示舊內容

如果 `predictiongod.app` 仍然顯示舊的 Flutter 應用：

1. **確認 Cloudflare Pages 專案名稱**
   - 確認 `predictiongod` 專案是 Next.js 應用
   - 檢查是否有兩個不同的專案（一個 Flutter，一個 Next.js）

2. **檢查自定義域名設置**
   - Cloudflare Pages Dashboard → `predictiongod` → Custom domains
   - 確認 `predictiongod.app` 正確連接到這個專案

3. **清除緩存**
   - Cloudflare Dashboard → Caching → Configuration
   - 清除所有緩存

4. **檢查 DNS 設置**
   - Cloudflare Dashboard → DNS
   - 確認 `predictiongod.app` 的 DNS 記錄正確
