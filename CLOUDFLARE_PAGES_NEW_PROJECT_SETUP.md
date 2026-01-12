# Cloudflare Pages 創建新專案並連接 GitHub

## 問題
當前 `predictiongod` 專案是通過 Direct Upload（GitHub Actions）部署的，無法使用 Cloudflare Pages 的原生 Next.js 構建。

## 解決方案：創建新專案並連接 GitHub

### 步驟 1: 創建新 Cloudflare Pages 專案

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - 登入你的帳號

2. **創建新專案**
   - Workers & Pages → Pages
   - 點擊 **"Create a project"** 或 **"Create application"**
   - 選擇 **"Connect to Git"** 或 **"Connect to GitHub"**

3. **連接 GitHub 倉庫**
   - 授權 Cloudflare 訪問你的 GitHub 帳號（如果還沒有）
   - 選擇倉庫：`dannykan/prediction-web`（或正確的倉庫名稱）
   - 點擊 **"Begin setup"**

### 步驟 2: 配置構建設置

在設置頁面，配置以下設置：

1. **Project name**
   - 可以繼續使用 `predictiongod`，或者使用新名稱（如 `predictiongod-nextjs`）
   - ⚠️ **注意**：如果使用相同名稱，需要先刪除或重命名舊專案

2. **Production branch**
   - 選擇 `main`

3. **Framework preset**
   - 選擇 **"Next.js"**（不是 "Next.js (Static HTML Export)"）

4. **Root directory**
   - 設置為 `prediction-web`

5. **Build command**
   - 留空（讓 Cloudflare 自動檢測）或 `npm run build`

6. **Build output directory**
   - 留空（Next.js 會自動處理）

7. **Node version**
   - 選擇 `20`

8. **Environment variables**
   - 在構建設置頁面，添加以下環境變數（適用於 Production 和 Preview）：
     - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
     - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`（或你的新域名）

### 步驟 3: 保存並部署

1. **點擊 "Save and Deploy"**
   - Cloudflare Pages 會自動構建並部署你的 Next.js 應用

2. **等待構建完成**
   - 查看構建日誌，確認構建成功

### 步驟 4: 設置自定義域名（如果需要）

1. **如果使用新專案名稱**
   - 在 Settings → Custom domains
   - 添加自定義域名：`predictiongod.app`
   - 按照指示更新 DNS 記錄

2. **如果使用相同專案名稱**
   - 域名應該已經連接
   - 確認 DNS 設置正確

### 步驟 5: 刪除或禁用舊專案

1. **刪除舊專案（如果使用新名稱）**
   - 進入舊的 `predictiongod` 專案
   - Settings → General
   - 點擊 **"Delete"** 按鈕
   - 確認刪除

2. **或重命名舊專案**
   - Settings → General
   - 點擊 **"Rename"** 按鈕
   - 重命名為 `predictiongod-old` 或類似名稱

---

## 如果無法創建新專案

如果無法創建新專案或連接 GitHub，可以：

1. **檢查 GitHub 授權**
   - Cloudflare Dashboard → My Profile → GitHub
   - 確認 GitHub 已連接並授權

2. **檢查倉庫權限**
   - 確認 Cloudflare 有權訪問 `dannykan/prediction-web` 倉庫

3. **檢查 Cloudflare 帳號權限**
   - 確認你的帳號有創建 Pages 專案的權限

---

## 關於 GitHub Actions

創建新專案並連接 GitHub 後：

1. **可以禁用 GitHub Actions workflow**
   - 在 GitHub 倉庫中，Settings → Actions → General
   - 可以禁用特定的 workflow

2. **或保留 GitHub Actions**
   - 但確保 Cloudflare Pages 不會被覆蓋
   - 可能需要調整 workflow 配置

---

## 驗證部署

部署完成後：

1. **檢查構建日誌**
   - Cloudflare Pages Dashboard → `predictiongod` → Deployments
   - 查看最新部署的構建日誌
   - 確認構建成功 ✅

2. **訪問網站**
   - 預覽 URL: `https://[hash].predictiongod.pages.dev`
   - 生產 URL: `https://predictiongod.app`
   - 確認網站正常運行

3. **檢查 API 連接**
   - 打開瀏覽器開發者工具
   - 檢查 Network 標籤
   - 確認 API 請求正確

---

## 總結

創建新專案並連接 GitHub 是最簡單和推薦的方法，因為：
- ✅ Cloudflare Pages 原生支持 Next.js
- ✅ 自動構建和部署
- ✅ 不需要額外的適配器
- ✅ 更簡單的配置

完成後，你的 Next.js 應用應該可以正常部署和運行。
