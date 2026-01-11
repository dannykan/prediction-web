# Cloudflare Pages 設置指南

## ✅ 已完成

- ✅ 代碼已推送到 GitHub: https://github.com/dannykan/prediction-web.git
- ✅ 倉庫包含 `prediction-web` 和 `prediction-backend` 目錄

## 🚀 下一步：更新 Cloudflare Pages 配置

### 步驟 1: 更新現有的 predictiongod 專案

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Pages → 找到 `predictiongod` 專案

2. **更新構建設置**
   - Settings → Builds & deployments
   - 更新以下設置：
     - **Root directory**: `/prediction-web`
     - **Build command**: `cd prediction-web && npm install && npm run build`
     - **Build output directory**: `prediction-web/.next`
     - **Framework preset**: `Next.js`
     - **Node version**: `18` 或更高

3. **更新環境變數**
   - Settings → Environment variables
   - 更新或添加（Production 環境）：
     ```
     NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
     NEXT_PUBLIC_SITE_URL=https://predictiongod.app
     ```

4. **更新 GitHub 連接（如果需要）**
   - Settings → Integrations → GitHub
   - 確認連接的是 `dannykan/prediction-web` 倉庫
   - 如果連接的是舊倉庫，需要重新連接

### 步驟 2: 觸發重新部署

有兩種方式：

#### 方式 A: 自動部署（推薦）

推送任何更改到 GitHub 會自動觸發部署：

```bash
# 創建一個小改動來觸發部署
cd /Users/dannykan/Prediction-God
echo "# Deployment trigger" >> .deploy-trigger
git add .deploy-trigger
git commit -m "chore: Trigger Cloudflare Pages deployment"
git push origin main
```

#### 方式 B: 手動觸發

1. 在 Cloudflare Pages 專案中
2. Deployments → Create deployment
3. 選擇 `main` 分支
4. 點擊 Deploy

### 步驟 3: 驗證部署

部署完成後（約 2-3 分鐘）：

1. **檢查部署狀態**
   - Cloudflare Pages → Deployments
   - 確認最新部署顯示 ✅ Success

2. **訪問網站**
   - https://predictiongod.app
   - 應該看到 Next.js 版本的頁面

3. **檢查功能**
   - [ ] 首頁載入正常
   - [ ] 市場列表顯示
   - [ ] 登入功能正常
   - [ ] 關注功能正常

---

## 🔧 如果遇到問題

### 問題 1: 構建失敗

**檢查**：
- 構建日誌中的錯誤訊息
- 確認 Node.js 版本（建議 18+）
- 確認構建命令正確

**解決**：
- 檢查 `prediction-web/package.json` 中的構建腳本
- 確認所有依賴都已安裝

### 問題 2: 環境變數未生效

**檢查**：
- 環境變數是否設置在正確的環境（Production）
- 變數名稱是否正確（注意 `NEXT_PUBLIC_` 前綴）

**解決**：
- 重新設置環境變數
- 觸發新的部署

### 問題 3: 頁面顯示舊版本

**解決**：
- 清除 Cloudflare 緩存
- 或等待幾分鐘讓緩存自動更新

---

## 📝 後續更新

以後更新代碼：

```bash
cd /Users/dannykan/Prediction-God
git add .
git commit -m "你的更改描述"
git push origin main
```

Cloudflare Pages 會自動檢測更改並部署。

---

## ✅ 完成檢查清單

- [ ] Cloudflare Pages 構建設置已更新
- [ ] 環境變數已設置
- [ ] GitHub 倉庫已連接
- [ ] 部署成功
- [ ] 網站正常訪問
- [ ] 功能測試通過

完成後，`https://predictiongod.app` 將顯示 Next.js 版本，完全替換 Flutter 版本！
