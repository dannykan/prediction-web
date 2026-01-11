# 快速更新後端 - Railway

## ✅ 情況

你已經在 Railway 上部署過後端，現在只需要：
1. **推送新代碼**到 GitHub
2. **Railway 自動部署**（如果已連接 GitHub）
3. **確認 Migration 執行**（如果有新的 migration）

## 🚀 更新步驟

### 步驟 1: 推送代碼

```bash
cd /Users/dannykan/Prediction-God
git add .
git commit -m "update: Update backend with latest changes"
git push origin main
```

### 步驟 2: Railway 自動部署

如果 Railway 已連接 GitHub：
- ✅ Railway 會自動檢測到新的推送
- ✅ 自動開始構建和部署
- ✅ 部署時間約 3-5 分鐘

**查看部署狀態**：
- Railway Dashboard → 你的服務 → **Deployments**
- 確認最新部署狀態為 ✅ Success

### 步驟 3: 檢查 Migration（重要！）

根據代碼庫，有以下新的 migration 可能需要執行：

1. **CreateMarketFollows** (1767200000000) - 市場關注功能
2. **AddReferralSystem** (1764729229000) - 邀請系統
3. 其他 migration（如果之前沒有執行過）

**檢查方式**：
- Railway Dashboard → 你的服務 → **Logs**
- 查找 migration 相關訊息
- 確認 migration 執行成功

**如果 Migration 失敗**：
- 檢查日誌中的錯誤訊息
- 確認資料庫連接正常
- 可能需要手動執行 migration

### 步驟 4: 驗證部署

1. **健康檢查**
   ```bash
   curl https://prediction-backend-production-8f6c.up.railway.app/health
   ```
   應該返回：`{"status":"ok"}`

2. **檢查新 API（如果有）**
   - 測試新的 API endpoints
   - 確認功能正常

---

## 📋 新功能檢查清單

根據代碼庫，以下功能可能需要確認：

### 1. 邀請系統 (Referrals) ✅
- `GET /referrals/stats` - 獲取邀請統計
- `GET /referrals/details` - 獲取邀請記錄
- `POST /referrals/apply` - 應用邀請碼

### 2. 市場關注功能 (Follow Market) ✅
- `POST /markets/:id/follow` - 關注市場
- `DELETE /markets/:id/follow` - 取消關注
- `GET /markets/:id/follow/status` - 檢查關注狀態

### 3. 分類功能 ✅
- `GET /categories` - 獲取分類列表
- 分類從資料庫動態獲取

---

## ⚠️ 注意事項

### 1. Migration 自動執行

Railway 會在部署時自動執行 migration（如果配置正確）：
- 檢查 `package.json` 中的 `start:prod` 腳本
- 確認 migration 在啟動時執行

### 2. 環境變數

確認以下環境變數已設置（如果之前已設置，不需要更改）：
- `DATABASE_URL` - Railway 自動設置
- `NODE_ENV=production`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FRONTEND_URL=https://predictiongod.app`
- `API_URL` - 你的 Railway URL

### 3. 如果 Railway 沒有自動部署

**檢查**：
- Railway Dashboard → Settings → Source
- 確認 GitHub 倉庫已連接
- 確認分支為 `main`

**解決**：
- 如果沒有連接，重新連接 GitHub 倉庫
- 或手動觸發部署：Deployments → Redeploy

---

## ✅ 完成檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] Railway 自動部署成功
- [ ] Migration 執行成功（檢查日誌）
- [ ] 健康檢查通過
- [ ] 新 API 功能正常（如果有）

---

## 🎉 完成後

後端更新完成後：
1. 確認後端 URL 沒有變化
2. 如果後端 URL 有變化，更新前端環境變數
3. 觸發前端部署（如果需要）
