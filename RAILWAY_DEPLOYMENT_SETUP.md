# Railway 後端部署設置指南

## ✅ 已完成

- ✅ 代碼已推送到 GitHub: https://github.com/dannykan/prediction-web.git
- ✅ 倉庫包含 `prediction-backend` 目錄

## 🚀 下一步：部署到 Railway

### 步驟 1: 創建 Railway 專案

1. **訪問 Railway Dashboard**
   - https://railway.app
   - 登入你的帳號

2. **創建新專案**
   - New Project → Deploy from GitHub repo
   - 選擇 `dannykan/prediction-web` 倉庫
   - 選擇 `prediction-backend` 作為服務根目錄

### 步驟 2: 設置環境變數

在 Railway 服務設置中：

1. **進入 Variables 標籤**
2. **添加以下環境變數**：

```bash
FRONTEND_URL=https://predictiongod.app
NODE_ENV=production
PORT=5001
```

3. **DATABASE_URL** 會由 Railway 自動設置（見步驟 3）

### 步驟 3: 添加 PostgreSQL 資料庫

1. **在 Railway 專案中**
   - New → Database → Add PostgreSQL
   - Railway 會自動創建 PostgreSQL 服務

2. **自動設置**
   - Railway 會自動設置 `DATABASE_URL` 環境變數
   - 不需要手動配置

3. **執行 Migration**
   - Railway 會在啟動時自動執行 migration
   - 檢查部署日誌確認 migration 成功

### 步驟 4: 設置啟動命令

在 Railway 服務設置中：

1. **Settings → Deploy**
2. **確認 Start Command** 為：
   ```bash
   npm run start:prod
   ```

### 步驟 5: 驗證部署

部署完成後（約 3-5 分鐘）：

1. **檢查部署狀態**
   - Railway Dashboard → Deployments
   - 確認最新部署顯示 ✅ Success

2. **檢查健康檢查**
   ```bash
   curl https://prediction-backend-production-8f6c.up.railway.app/health
   ```

3. **檢查日誌**
   - Railway Dashboard → 你的服務 → Logs
   - 確認沒有錯誤
   - 確認 migration 執行成功

---

## 🔧 如果遇到問題

### 問題 1: Migration 失敗

**檢查**：
- Railway 日誌中的錯誤訊息
- 確認資料庫連接正常

**解決**：
- 檢查 `DATABASE_URL` 是否正確設置
- 確認 migration 文件存在

### 問題 2: 服務無法啟動

**檢查**：
- Railway 日誌中的錯誤訊息
- 確認環境變數已設置
- 確認 `package.json` 中的腳本正確

**解決**：
- 檢查啟動命令是否正確
- 確認所有依賴都已安裝

### 問題 3: API 連接失敗

**檢查**：
- 前端環境變數 `NEXT_PUBLIC_API_BASE_URL` 是否正確
- 後端 CORS 配置是否允許前端域名

**解決**：
- 確認環境變數已設置並重新部署
- 檢查後端 CORS 配置

---

## 📝 後續更新

以後更新代碼：

```bash
cd /Users/dannykan/Prediction-God
git add .
git commit -m "你的更改描述"
git push origin main
```

Railway 會自動檢測更改並部署。

---

## ✅ 完成檢查清單

- [ ] Railway 專案已創建
- [ ] GitHub 倉庫已連接
- [ ] 環境變數已設置
- [ ] PostgreSQL 資料庫已添加
- [ ] Migration 執行成功
- [ ] 服務正常運行
- [ ] 健康檢查通過

完成後，後端 API 將在 Railway 上運行！
