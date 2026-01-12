# Cloudflare 設置表單填寫指南

## ⚠️ 重要提示

你看到的表單是 **Cloudflare Workers** 的設置表單，但對於 Next.js 應用，應該使用 **Cloudflare Pages**。

不過，如果你已經開始填寫，可以按照以下方式填寫，然後我們再切換到正確的設置。

## 表單填寫指南

### 1. Source Repository
- **值**: `dannykan/prediction-web` ✅ (已自動填充)
- **說明**: 你的 GitHub 倉庫

### 2. Project name
- **值**: `predictiongod` 或 `prediction-web`
- **說明**: 建議使用 `predictiongod` 以保持一致性

### 3. Build command ⚠️ 重要
- **值**: `cd prediction-web && npm run build`
- **說明**: 
  - 因為你的 Next.js 項目在 `prediction-web` 子目錄中
  - 需要先進入該目錄，然後執行構建命令
  - 或者：`npm run build --prefix prediction-web`

### 4. Deploy command
- **值**: `npx wrangler deploy` ✅ (已填充)
- **說明**: 保持默認值

### 5. Builds for non-production branches
- **狀態**: ✅ 勾選 (推薦)
- **說明**: 這樣可以為其他分支創建預覽部署

### 6. Advanced settings

#### Non-production branch deploy command
- **值**: `npx wrangler versions upload` ✅ (已填充)
- **說明**: 保持默認值

#### Path ⚠️ 非常重要
- **當前值**: `/`
- **問題**: 對於 Next.js App Router，這個設置可能不正確
- **建議**: 
  - 如果這是 Workers 表單，可能需要設置為 `.next` 或 `prediction-web/.next`
  - 但實際上，Next.js App Router 不能直接部署 `.next` 目錄
  - **更好的做法**: 切換到 Cloudflare Pages

### 7. API token
- **值**: `+ Create new token` ✅
- **說明**: 讓 Cloudflare 自動創建，不需要手動填寫

### 8. Variables (環境變數)
- **需要添加以下變數**:
  - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
  - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

---

## ⚠️ 更好的解決方案：使用 Cloudflare Pages

由於你看到的是 **Workers** 表單，而 Next.js 應該使用 **Pages**，建議：

### 步驟 1: 取消當前設置

如果可能，取消當前設置，然後：

### 步驟 2: 創建 Cloudflare Pages 專案

1. **在 Cloudflare Dashboard**
   - Workers & Pages → **Pages** (不是 Workers)
   - 點擊 **"Create a project"**
   - 選擇 **"Connect to Git"**

2. **連接 GitHub**
   - 選擇 `dannykan/prediction-web` 倉庫
   - 點擊 **"Begin setup"**

3. **在 Pages 設置頁面填寫**:
   - **Project name**: `predictiongod`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Root directory**: `prediction-web`
   - **Build command**: 留空（自動檢測）或 `npm run build`
   - **Build output directory**: 留空（Next.js 自動處理）
   - **Node version**: `20`

4. **環境變數**:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

---

## 如果必須使用當前表單

如果你必須使用當前的 Workers 表單，請填寫：

1. **Build command**: `cd prediction-web && npm run build`
2. **Path**: `/` (先試試，如果不工作再改為 `prediction-web/.next`)
3. **Variables**: 添加上述環境變數

但這可能不會正常工作，因為 Next.js App Router 需要特殊處理。

---

## 推薦操作

**強烈建議使用 Cloudflare Pages 而不是 Workers**，因為：
- ✅ Cloudflare Pages 原生支持 Next.js
- ✅ 自動處理構建和部署
- ✅ 不需要手動配置 Path
- ✅ 更簡單的設置

如果你已經開始填寫 Workers 表單，可以：
1. 取消當前設置
2. 轉到 Pages 標籤
3. 創建新的 Pages 專案
4. 按照上面的 Pages 設置指南填寫
