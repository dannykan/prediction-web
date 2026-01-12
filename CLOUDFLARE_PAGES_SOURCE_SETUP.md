# Cloudflare Pages 連接 GitHub 設置指南

## 問題
在 Cloudflare Pages Settings 中看不到 "Builds & deployments" 設置，只能看到：
- Variables and Secrets
- Bindings
- Runtime
- General

這表示專案可能沒有連接 GitHub 自動構建。

## 解決方案：連接 GitHub

### 步驟 1: 檢查 Source 設置

1. **在 Cloudflare Pages Dashboard**
   - 進入 `predictiongod` 專案
   - 點擊 **Settings** 標籤
   - 查看是否有 **"Source"** 或 **"GitHub"** 區塊

2. **如果看到 "Not connected" 或 "Connect to Git"**
   - 點擊 **"Connect to Git"** 或 **"Connect GitHub"** 按鈕
   - 授權 Cloudflare 訪問你的 GitHub 帳號
   - 選擇倉庫：`dannykan/prediction-web`（或正確的倉庫）
   - 選擇分支：`main`
   - 設置根目錄：`prediction-web`

### 步驟 2: 設置構建配置

連接 GitHub 後，應該會出現 **"Builds & deployments"** 設置：

1. **進入構建設置**
   - Settings → Builds & deployments

2. **配置構建設置**
   - **Framework preset**: `Next.js`（不是 "Static HTML Export"）
   - **Root directory**: `prediction-web`
   - **Build command**: 留空（自動檢測）或 `npm run build`
   - **Build output directory**: 留空（Next.js 自動處理）
   - **Node version**: `20`

3. **環境變數**
   - 環境變數已經在 Variables and Secrets 中設置了
   - 確認以下變數存在：
     - `NEXT_PUBLIC_API_BASE_URL`
     - `NEXT_PUBLIC_SITE_URL`

### 步驟 3: 觸發部署

連接 GitHub 後，Cloudflare Pages 會自動：
1. 監聽 GitHub 推送
2. 自動構建 Next.js 應用
3. 部署到 Cloudflare Pages

你可以：
- 推送代碼觸發部署
- 或在 Dashboard 中手動觸發 "Retry deployment"

---

## 如果沒有 "Source" 選項

如果 Settings 頁面完全沒有 "Source" 或 "GitHub" 選項，可能需要：

1. **檢查專案類型**
   - 確認這是 Cloudflare Pages 專案，不是 Workers 專案
   - 確認專案名稱是 `predictiongod`

2. **重新創建專案（最後手段）**
   - 如果無法連接 GitHub，可能需要創建新專案並連接 GitHub
   - 但這會導致 URL 改變，需要重新設置自定義域名

---

## 替代方案：使用 GitHub Actions（如果無法連接 GitHub）

如果無法在 Cloudflare Pages 中連接 GitHub，可以繼續使用 GitHub Actions，但需要：
1. 安裝 `@opennextjs/cloudflare` 適配器
2. 修改構建流程
3. 使用正確的構建輸出目錄

但這更複雜，推薦優先嘗試連接 GitHub。
