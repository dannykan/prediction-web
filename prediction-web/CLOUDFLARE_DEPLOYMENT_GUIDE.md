# 🚀 Cloudflare Pages 部署完整指南

## 📋 目錄
1. [首次設置](#首次設置)
2. [環境變量配置](#環境變量配置)
3. [日常部署流程](#日常部署流程)
4. [驗證檢查清單](#驗證檢查清單)
5. [常見問題排查](#常見問題排查)

---

## 🎯 首次設置

### 步驟 1: Cloudflare Pages 項目配置

1. **訪問 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/[your-account]/pages
   ```

2. **找到項目 `predictiongod`**

3. **檢查基本設置** (Settings → Builds & deployments)

   確認以下配置：
   ```
   Framework preset: Next.js
   Build command: npm run build:cloudflare
   Build output directory: .open-next
   Root directory: prediction-web
   Node.js version: 20
   ```

4. **配置分支部署** (Settings → Builds & deployments)

   推薦設置：
   ```
   Production branch: main
   Branch deployments: None
   ```

   這樣可以：
   - ✅ 避免重複部署
   - ✅ 節省構建時間
   - ✅ 更清晰的部署歷史

---

## 🔧 環境變量配置

### 步驟 2: 設置生產環境變量

**重要**: 這是最容易出錯的部分！

1. **訪問環境變量設置**
   ```
   Settings → Environment variables
   ```

2. **添加以下變量** (點擊 "Add variable")

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://prediction-backend-production-8f6c.up.railway.app` | **Production** ⚠️ |
   | `NEXT_PUBLIC_SITE_URL` | `https://predictiongod.app` | **Production** ⚠️ |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `533269043110-sgfuoiue0k2ctj0h7hca06pv9tlbc9k8.apps.googleusercontent.com` | **Production** ⚠️ |
   | `NODE_VERSION` | `20` | **Production** ⚠️ |

   **關鍵注意事項**:
   - ⚠️ Environment 必須選擇 **"Production"**（不是 Preview）
   - ⚠️ `NEXT_PUBLIC_API_BASE_URL` **不要**有尾部斜線 `/`
   - ⚠️ 變量名稱**區分大小寫**，必須完全一致
   - ⚠️ 設置後必須**重新部署**才會生效

3. **保存所有變量**

   點擊 "Save" 或 "Save and deploy"

---

## 📦 日常部署流程

### 最佳實踐：Git Push 自動部署

#### 步驟 3: 代碼更改和推送

這是**最推薦**的部署方式：

```bash
# 1. 確保在 prediction-web 目錄
cd /Users/dannykan/Prediction-God

# 2. 查看當前狀態
git status

# 3. 添加更改
git add .

# 4. 提交更改（使用清晰的 commit message）
git commit -m "feat: 添加新功能"
# 或
git commit -m "fix: 修復登入問題"
# 或
git commit -m "chore: 更新依賴"

# 5. 推送到 main 分支
git push origin main
```

#### 自動觸發

推送後，Cloudflare Pages 會**自動**：
1. ✅ 檢測到新的 commit
2. ✅ 開始構建（約 3-5 分鐘）
3. ✅ 運行構建命令：`npm run build:cloudflare`
4. ✅ 執行後處理腳本（`post-build.js` + `fix-worker.js`）
5. ✅ 部署到生產環境
6. ✅ 更新 `predictiongod.app` 域名

---

## ✅ 驗證檢查清單

### 步驟 4: 部署後驗證

每次部署後，按以下順序檢查：

#### 1. 檢查 Cloudflare Dashboard

訪問：
```
https://dash.cloudflare.com/[account]/pages/predictiongod
```

確認：
- [ ] 最新部署狀態是 **"Success"** ✅
- [ ] 構建時間合理（3-8 分鐘）
- [ ] 沒有紅色錯誤訊息

#### 2. 檢查構建日誌

點擊最新部署 → "View build log"

**必須看到**：
```
✅ Clone repository
✅ Install dependencies
✅ Build application
   ...
   📦 Post-build processing for Cloudflare Pages...
   1️⃣  Moving assets to root level...
   2️⃣  Creating _worker.js...
   3️⃣  Copying wrangler.toml...
   4️⃣  Verifying deployment structure...
   🎉 Post-build processing complete!

   🔧 Fixing _worker.js to serve static assets...
   ✅ _worker.js patched successfully
   📝 Added static asset handling for:
      - /_next/static/*
      - /images/*
      - .css, .js, .woff2, .png, etc.
✅ Deploy
```

**如果缺少後處理輸出**：
- ❌ 說明構建腳本有問題
- ❌ 需要檢查 `package.json` 的 `build:cloudflare` 命令

#### 3. 檢查網站

訪問：`https://predictiongod.app/home`

**視覺檢查**：
- [ ] 頁面正常顯示（不是空白）
- [ ] CSS 樣式正確（有顏色、漸變、間距）
- [ ] 圖片和 Logo 正常顯示
- [ ] 字體正確加載

#### 4. 檢查瀏覽器控制台

按 `F12` 打開開發工具：

**Console 面板**：
- [ ] 沒有 `NEXT_PUBLIC_* is not set` 錯誤
- [ ] 沒有紅色錯誤訊息
- [ ] 可以有黃色警告（通常無害）

**Network 面板**（刷新頁面）：
- [ ] HTML: `200 OK`
- [ ] CSS 文件: `200 OK`（不是 404）
- [ ] JS 文件: `200 OK`（不是 404）
- [ ] API 請求: `200 OK` 或 `401 Unauthorized`（正常，因為未登入）

**不應該看到**：
- ❌ `404 Not Found` for CSS/JS files
- ❌ `500 Internal Server Error`
- ❌ `501 Not Implemented`

#### 5. 測試核心功能

- [ ] Google 登入按鈕可點擊
- [ ] 市場列表可以加載（如果有數據）
- [ ] 導航正常工作

---

## 🏗️ 構建命令詳解

### 當前構建流程

```json
{
  "build:cloudflare": "rm -rf .next .open-next && next build && opennextjs-cloudflare build && node scripts/post-build.js && node scripts/fix-worker.js"
}
```

#### 步驟解析

1. **`rm -rf .next .open-next`**
   - 刪除舊的構建緩存
   - 確保每次都是乾淨構建
   - 避免 CSS 哈希值不匹配問題

2. **`next build`**
   - Next.js 標準構建
   - 生成優化的生產代碼
   - 輸出到 `.next/` 目錄

3. **`opennextjs-cloudflare build`**
   - 將 Next.js 應用轉換為 Cloudflare Worker 格式
   - 生成 `worker.js` 和相關文件
   - 輸出到 `.open-next/` 目錄

4. **`node scripts/post-build.js`**
   - 移動靜態資源到正確位置
   - 創建 `_worker.js`（從 `worker.js`）
   - 複製 `wrangler.toml` 配置文件
   - 驗證文件結構

5. **`node scripts/fix-worker.js`** ⭐ 關鍵
   - 添加 `url` 變量定義
   - 插入靜態資源處理邏輯
   - 修復 opennextjs-cloudflare 的不足
   - **確保 CSS/JS 文件正常提供**

---

## 🚨 常見問題排查

### 問題 1: 部署成功但頁面 404

**症狀**：
- Cloudflare 顯示部署成功
- 訪問網站返回 404

**原因**：
- `_worker.js` 沒有正確生成
- 或者路由配置錯誤

**解決方案**：
```bash
# 檢查本地構建
cd prediction-web
npm run build:cloudflare

# 檢查文件是否存在
ls -la .open-next/_worker.js
ls -la .open-next/_next/

# 如果缺少文件，檢查構建日誌
```

---

### 問題 2: CSS/JS 文件 404

**症狀**：
- 頁面顯示但沒有樣式
- 控制台顯示 `/_next/static/chunks/*.css 404`

**原因**：
- `fix-worker.js` 沒有運行
- 或者 `_worker.js` 沒有正確修補

**解決方案**：

檢查本地構建日誌：
```bash
npm run build:cloudflare 2>&1 | grep -A 5 "Fixing _worker.js"
```

應該看到：
```
🔧 Fixing _worker.js to serve static assets...
   Added url definition at start of handler
   Removed duplicate url definition at line 30
✅ _worker.js patched successfully
```

如果沒看到，檢查 `package.json` 的 `build:cloudflare` 命令。

---

### 問題 3: 環境變量不生效

**症狀**：
- 控制台錯誤：`NEXT_PUBLIC_* is not set`
- API 請求到錯誤的 URL

**原因**：
- 環境變量設置到 Preview 而不是 Production
- 或者設置後沒有重新部署

**解決方案**：

1. **檢查環境變量**
   ```
   Settings → Environment variables
   ```
   確認 "Environment" 列顯示 **"Production"**

2. **觸發新部署**
   ```bash
   # 推送任何小改動
   echo "# Trigger rebuild" >> .env.trigger
   git add .env.trigger
   git commit -m "chore: Trigger rebuild"
   git push origin main
   ```

3. **驗證**

   部署完成後，查看構建日誌，應該顯示：
   ```
   Environment:
     NEXT_PUBLIC_API_BASE_URL=https://...
     NEXT_PUBLIC_SITE_URL=https://...
   ```

---

### 問題 4: 部署時間過長或失敗

**症狀**：
- 部署超過 10 分鐘
- 構建超時或失敗

**可能原因**：
- 依賴安裝問題
- 構建命令錯誤
- Cloudflare 服務問題

**解決方案**：

1. **檢查構建日誌**，找到失敗的步驟

2. **本地測試構建**：
   ```bash
   cd prediction-web
   rm -rf node_modules .next .open-next
   npm install
   npm run build:cloudflare
   ```

3. **如果本地成功但 Cloudflare 失敗**：
   - 可能是 Node 版本不匹配
   - 檢查 `NODE_VERSION` 環境變量是否設置為 `20`

---

### 問題 5: 重複部署

**症狀**：
- 同一個 commit 出現多次部署
- 部署列表很混亂

**原因**：
- Preview deployments 啟用
- 或 GitHub webhook 重複觸發

**解決方案**：

1. **關閉 Preview deployments**：
   ```
   Settings → Builds & deployments → Branch deployments → None
   ```

2. **檢查 GitHub Webhooks**：
   ```
   https://github.com/dannykan/prediction-web/settings/hooks
   ```
   確保只有 1 個 Cloudflare webhook

---

## 📊 部署狀態理解

### 成功的部署

```
Deployment: abc123de.predictiongod.pages.dev
Status: ✅ Success
Duration: 4m 32s
Commit: abc123d - "feat: 添加新功能"
Environment: Production
```

### 失敗的部署

```
Deployment: xyz789ab.predictiongod.pages.dev
Status: ❌ Failed
Error: Build exceeded maximum time limit
```

需要點擊 "View build log" 查看詳細錯誤。

---

## 🎯 推薦工作流程

### 標準開發流程

```bash
# 1. 本地開發
cd prediction-web
npm run dev

# 2. 測試更改
# 在瀏覽器訪問 http://localhost:3001

# 3. 提交代碼
git add .
git commit -m "feat: 新功能"

# 4. 推送到 GitHub（自動觸發 Cloudflare 部署）
git push origin main

# 5. 等待部署完成（3-8 分鐘）
# 訪問 Cloudflare Dashboard 查看進度

# 6. 驗證生產環境
# 訪問 https://predictiongod.app/home

# 7. 檢查瀏覽器控制台
# F12 → Console + Network
```

### 快速修復流程

如果部署出問題需要快速修復：

```bash
# 1. 修復代碼
# 編輯相關文件

# 2. 本地測試構建
npm run build:cloudflare

# 3. 如果本地成功，推送
git add .
git commit -m "fix: 修復部署問題"
git push origin main

# 4. 監控 Cloudflare 部署
```

---

## 🛡️ 防錯檢查清單

### 推送前檢查

每次 `git push` 前：

- [ ] 本地開發服務器運行正常（`npm run dev`）
- [ ] 沒有 TypeScript 錯誤（`npm run typecheck`）
- [ ] Commit message 清晰描述更改
- [ ] 確認推送到正確的分支（`main`）

### 部署後檢查

每次部署後：

- [ ] Cloudflare 部署狀態是 "Success"
- [ ] 構建日誌包含後處理腳本輸出
- [ ] 網站可以正常訪問
- [ ] CSS/JS 文件正常加載（F12 → Network）
- [ ] 控制台沒有環境變量錯誤

---

## 📝 快速參考

### 關鍵 URLs

```
Cloudflare Dashboard:
https://dash.cloudflare.com/[account]/pages/predictiongod

生產網站:
https://predictiongod.app

環境變量設置:
https://dash.cloudflare.com/[account]/pages/predictiongod/settings/environment-variables

部署歷史:
https://dash.cloudflare.com/[account]/pages/predictiongod/deployments
```

### 關鍵命令

```bash
# 本地開發
npm run dev

# 本地構建測試
npm run build:cloudflare

# 類型檢查
npm run typecheck

# 代碼格式化
npm run format

# 部署（推送到 GitHub）
git push origin main
```

### 關鍵文件

```
配置文件:
- prediction-web/package.json (build:cloudflare 命令)
- prediction-web/wrangler.toml (Cloudflare Worker 配置)
- prediction-web/next.config.ts (Next.js 配置)

構建腳本:
- prediction-web/scripts/post-build.js (後處理)
- prediction-web/scripts/fix-worker.js (Worker 修補)

環境變量:
- prediction-web/.env.local (本地開發)
- Cloudflare Dashboard (生產環境)
```

---

## 🎉 成功部署的標誌

當一切正常時，你應該看到：

### Cloudflare Dashboard
- ✅ 狀態：Success
- ✅ 時長：3-8 分鐘
- ✅ 構建日誌完整（包含後處理輸出）

### 生產網站
- ✅ https://predictiongod.app 可訪問
- ✅ UI/UX 完整顯示
- ✅ 所有樣式正確
- ✅ 功能正常工作

### 瀏覽器控制台
- ✅ 沒有紅色錯誤
- ✅ 所有資源 200 OK
- ✅ API 請求到正確的後端

---

## 💡 最佳實踐總結

### ✅ 推薦做法

1. **使用 Git Push 自動部署**
   - 不要手動上傳文件
   - 讓 Cloudflare 自動構建

2. **設置正確的環境變量**
   - 確保在 Production 環境
   - 部署後驗證

3. **關閉 Preview deployments**
   - 減少重複部署
   - 節省時間和資源

4. **每次推送前本地測試**
   - 運行 `npm run dev`
   - 確保沒有明顯錯誤

5. **使用清晰的 commit message**
   - 方便追蹤問題
   - 團隊協作更順暢

### ❌ 避免做法

1. **不要手動編輯 Cloudflare 生成的文件**
   - 不要在 Dashboard 中手動修改代碼
   - 所有更改應該通過 Git

2. **不要跳過本地測試**
   - 直接推送未測試的代碼可能導致生產環境故障

3. **不要在 Production 環境變量中使用 localhost**
   - 確保 URLs 是生產環境的

4. **不要忽略構建日誌**
   - 即使部署成功，也檢查日誌
   - 警告可能預示潛在問題

5. **不要頻繁強制推送**
   - 避免 `git push --force`
   - 可能覆蓋重要更改

---

**完成這些設置後，你的部署流程應該非常順暢！** 🚀

只需要：
```bash
git add .
git commit -m "你的更改"
git push origin main
```

然後等待 5 分鐘，網站就自動更新了！
