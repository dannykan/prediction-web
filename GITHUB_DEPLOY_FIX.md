# 透過 GitHub 修復 Railway 部署問題

## 🎯 問題現況

- ✅ 前端和後端都透過 GitHub 自動部署
- ✅ Railway 監聽 GitHub repository 的變更
- ✅ Cloudflare Pages 監聽 GitHub repository 的變更
- ❌ Admin 路由在 Railway 上返回 404

## 🔄 解決方案：觸發新的部署

### **方法 1：推送一個小改動到 GitHub（最簡單）**

這會觸發 Railway 和 Cloudflare 重新構建和部署。

#### **步驟 1：檢查當前 Git 狀態**

```bash
cd /Users/dannykan/Prediction-God
git status
git branch
```

#### **步驟 2：創建一個小改動**

我已經為你創建了 `.railway-version` 檔案，現在只需提交並推送：

```bash
# 添加所有新檔案（包括診斷工具和修復指南）
git add .

# 提交改動
git commit -m "fix: 強制 Railway 重新部署以修復 Admin 路由 404 問題

- 添加診斷工具 (railway-diagnostic.sh)
- 添加修復指南文件
- 更新 Railway 版本標記"

# 推送到 GitHub（觸發自動部署）
git push origin main
```

**如果你的主分支不是 `main`，請替換為實際分支名（例如 `master`）**

#### **步驟 3：監控部署**

**Railway：**
1. 前往 [Railway Dashboard](https://railway.app)
2. 選擇你的專案
3. 觀察 "Deployments" 標籤
4. 等待新部署完成（綠色勾選，約 2-3 分鐘）

**Cloudflare Pages：**
1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 選擇 Pages
3. 選擇 predictiongod 專案
4. 觀察部署狀態

#### **步驟 4：驗證修復**

等待部署完成後，執行診斷：

```bash
cd /Users/dannykan/Prediction-God/prediction-backend
./scripts/railway-diagnostic.sh
```

---

### **方法 2：如果你已經有未推送的改動**

如果你有其他未提交的改動，可以：

```bash
# 查看未提交的檔案
git status

# 方案 A：提交所有改動
git add .
git commit -m "fix: 更新部署配置並修復 Admin 路由問題"
git push origin main

# 方案 B：只提交診斷工具和版本檔案
git add prediction-backend/scripts/*.sh
git add prediction-backend/.railway-version
git add RAILWAY_FIX_GUIDE.md
git add RAILWAY_ENV_SETUP.md
git add DIAGNOSIS_SUMMARY.md
git add GITHUB_DEPLOY_FIX.md
git commit -m "fix: 添加診斷工具並觸發重新部署"
git push origin main
```

---

### **方法 3：使用空提交強制部署**

如果你不想改動任何檔案，可以使用空提交：

```bash
# 創建空提交（不改動任何檔案）
git commit --allow-empty -m "chore: 觸發 Railway 重新部署以修復 Admin 路由"

# 推送到 GitHub
git push origin main
```

這會觸發 Railway 和 Cloudflare 重新部署，但不改動任何程式碼。

---

## 📊 部署流程

當你推送到 GitHub 後：

```
GitHub Push
    ├─→ Railway 自動部署
    │   ├─ 1. 拉取最新代碼
    │   ├─ 2. 執行 npm run build
    │   ├─ 3. 執行 npm run start:prod
    │   └─ 4. 健康檢查 (/health)
    │
    └─→ Cloudflare Pages 自動部署
        ├─ 1. 拉取最新代碼
        ├─ 2. 執行 Flutter 構建
        └─ 3. 部署到 CDN
```

**預計時間：**
- Railway 部署：2-3 分鐘
- Cloudflare Pages 部署：3-5 分鐘

---

## 🔍 監控部署狀態

### **Railway 部署日誌**

1. 前往 Railway Dashboard
2. 點擊你的服務
3. 點擊 "Deployments" 標籤
4. 點擊最新的部署
5. 查看 "Build Logs" 和 "Deploy Logs"

**關鍵日誌訊息：**
```
✓ Build completed
✓ Starting deployment
✓ Health check passed
🚀 Application is running on: http://...
```

**常見錯誤：**
- `Module not found` → 檢查 package.json
- `Database connection failed` → 檢查 DATABASE_URL 環境變數
- `Firebase initialization failed` → 檢查 Firebase 環境變數

---

### **Cloudflare Pages 部署日誌**

1. 前往 Cloudflare Dashboard
2. 選擇 Pages → predictiongod
3. 點擊最新的部署
4. 查看構建日誌

**關鍵訊息：**
```
✓ Cloning repository
✓ Installing dependencies
✓ Building Flutter web
✓ Deploying to Cloudflare CDN
✓ Deployment complete
```

---

## ✅ 驗證部署成功

### **1. 執行自動診斷**

```bash
cd /Users/dannykan/Prediction-God/prediction-backend
./scripts/railway-diagnostic.sh
```

**預期輸出：**
```
✅ 健康檢查通過 (HTTP 200)
✅ Markets 端點正常 (HTTP 200)
✅ 認證機制正常運作 (HTTP 401)
✅ 正確拒絕無 header 的請求 (HTTP 403)  ← 應該是 403，不是 404
✅ Admin 端點正常 (HTTP 200)
✅ CORS preflight 成功
```

### **2. 手動測試 Admin 端點**

```bash
# 測試不帶 header（應該返回 403，不是 404）
curl -I https://prediction-backend-production-8f6c.up.railway.app/admin/markets

# 測試帶 header（應該返回 200）
curl -H "X-Admin-Authenticated: true" \
  https://prediction-backend-production-8f6c.up.railway.app/admin/markets
```

### **3. 測試前端功能**

訪問 https://predictiongod.app 並測試：
- ✅ 創建市場
- ✅ 下注
- ✅ Admin 管理功能

---

## 🚨 如果部署後仍有問題

### **檢查清單**

#### **1. Railway 環境變數**

確認以下變數已在 Railway Dashboard 設置：

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
FIREBASE_PROJECT_ID=prediction-god
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prediction-god.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<完整私鑰>
FRONTEND_URL=https://predictiongod.app
API_URL=https://prediction-backend-production-8f6c.up.railway.app
TZ=Asia/Taipei
```

詳細指南：參閱 `RAILWAY_ENV_SETUP.md`

#### **2. 檢查 Railway 構建命令**

在 Railway Dashboard → Settings 中確認：
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Health Check Path**: `/health`

#### **3. 檢查 GitHub Repository 分支**

確認 Railway 監聽的是正確的分支：
- Railway Dashboard → Settings → Source
- 確認 Branch 是 `main` 或 `master`（你實際使用的分支）

#### **4. 清除 Railway 構建快取**

如果推送後仍有問題：
1. Railway Dashboard → Settings
2. 尋找 "Clear Build Cache" 或類似選項
3. 點擊清除
4. 再次推送一個小改動

---

## 📝 完整的 Git 工作流程

### **標準工作流程**

```bash
# 1. 確保在正確的目錄
cd /Users/dannykan/Prediction-God

# 2. 拉取最新代碼（如果有協作者）
git pull origin main

# 3. 查看當前狀態
git status

# 4. 添加改動
git add .

# 5. 提交改動
git commit -m "fix: 修復 Railway Admin 路由問題

- 添加診斷工具
- 更新環境變數配置
- 強制重新部署"

# 6. 推送到 GitHub（觸發自動部署）
git push origin main

# 7. 等待 2-3 分鐘

# 8. 驗證部署
cd prediction-backend
./scripts/railway-diagnostic.sh
```

---

## 🎯 預期結果

推送到 GitHub 後：

**立即（0-30 秒）：**
- GitHub 接收到推送
- Railway 和 Cloudflare 接收到 webhook 通知

**2-3 分鐘後：**
- Railway 構建和部署完成
- Admin 路由開始正常工作

**3-5 分鐘後：**
- Cloudflare Pages 部署完成
- 前端更新完成

**總計：約 5 分鐘完成整個部署**

---

## 💡 快速參考命令

```bash
# 快速修復：推送改動觸發重新部署
cd /Users/dannykan/Prediction-God
git add .
git commit -m "fix: 觸發 Railway 重新部署"
git push origin main

# 等待 3 分鐘後驗證
cd prediction-backend
./scripts/railway-diagnostic.sh

# 如果仍有問題，創建空提交再次部署
git commit --allow-empty -m "chore: 再次觸發部署"
git push origin main
```

---

## 📞 需要協助？

如果推送後仍有問題，請提供：

1. **Git 推送輸出**
   ```bash
   git push origin main 2>&1 | tee git-push.log
   ```

2. **Railway 部署日誌**
   - Railway Dashboard → Deployments → 最新部署 → Logs

3. **診斷腳本輸出**
   ```bash
   ./scripts/railway-diagnostic.sh > diagnosis-after-deploy.txt
   ```

4. **當前環境變數列表**
   - Railway Dashboard → Variables（遮蔽敏感資訊）

---

## ✨ 成功標準

修復成功後，你應該看到：

```bash
# 診斷腳本輸出
✅ 健康檢查通過 (HTTP 200)
✅ Markets 端點正常 (HTTP 200)
✅ Admin 端點正常 (HTTP 200)  ← 關鍵！不再是 404
✅ CORS 設定正常

# 前端測試
✅ 可以創建市場
✅ 可以下注
✅ Admin 可以結算市場
✅ Admin 可以編輯用戶資訊
```

---

**現在就開始吧！推送改動到 GitHub，讓 Railway 重新部署！** 🚀
