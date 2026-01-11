# GitHub Secrets 設置指南 - 使用 GitHub Actions 部署

## ✅ 你已經有 GitHub Actions Workflow

你的倉庫已經有 `.github/workflows/deploy-cloudflare.yml` 文件，會自動部署到 Cloudflare Pages。

## 🔧 需要配置 GitHub Secrets

為了讓 GitHub Actions 正常工作，需要在 GitHub 倉庫中設置以下 Secrets：

### 步驟 1: 獲取 Cloudflare API Token

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com/profile/api-tokens

2. **創建 Token**
   - 點擊 **Create Token**
   - 使用模板 **"Edit Cloudflare Workers"**（推薦）
   - 或自定義創建：
     - Token name: `github-actions-cloudflare-pages`
     - Permissions:
       - Account > Cloudflare Pages > Edit
       - Account > Account Settings > Read
     - Account Resources: 選擇你的帳戶
   - 點擊 **Continue to summary**
   - 點擊 **Create Token**

3. **複製 Token**（重要：關閉頁面後無法再查看）
   - Token 格式類似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 保存到安全的地方

### 步驟 2: 獲取 Cloudflare Account ID

1. **訪問 Cloudflare Dashboard**
   - https://dash.cloudflare.com

2. **找到 Account ID**
   - 在右側邊欄可以看到 **Account ID**
   - 格式類似：`3f788981872971344ab14a8fcafa5c8f`
   - 點擊複製圖標 📋 複製

### 步驟 3: 在 GitHub 設置 Secrets

1. **訪問 GitHub 倉庫 Secrets 設置**
   - https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 或手動導航：
     - 訪問 https://github.com/dannykan/prediction-web
     - 點擊 **Settings** 標籤
     - 左側菜單：**Secrets and variables** → **Actions**

2. **添加第一個 Secret：CLOUDFLARE_API_TOKEN**
   - 點擊 **New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`（**必須完全匹配，區分大小寫**）
   - Secret: 貼上步驟 1 獲取的 API Token
   - 點擊 **Add secret**

3. **添加第二個 Secret：CLOUDFLARE_ACCOUNT_ID**
   - 點擊 **New repository secret**
   - Name: `CLOUDFLARE_ACCOUNT_ID`（**必須完全匹配，區分大小寫**）
   - Secret: 貼上步驟 2 獲取的 Account ID
   - 點擊 **Add secret**

4. **可選：添加環境變數 Secrets**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

### 步驟 4: 驗證設置

1. **檢查 Secrets 是否正確設置**
   - 訪問 https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 確認看到以下 Secrets：
     - ✅ `CLOUDFLARE_API_TOKEN`
     - ✅ `CLOUDFLARE_ACCOUNT_ID`
     - ✅ `NEXT_PUBLIC_API_BASE_URL`（可選）
     - ✅ `NEXT_PUBLIC_SITE_URL`（可選）

2. **觸發一次部署**
   ```bash
   cd /Users/dannykan/Prediction-God
   git add .
   git commit -m "test: Trigger GitHub Actions deployment"
   git push origin main
   ```

3. **檢查 GitHub Actions**
   - 訪問 https://github.com/dannykan/prediction-web/actions
   - 查看最新的 workflow run
   - 確認部署成功 ✅

## 📋 Secrets 檢查清單

- [ ] `CLOUDFLARE_API_TOKEN` 已設置
- [ ] `CLOUDFLARE_ACCOUNT_ID` 已設置
- [ ] Secret 名稱完全匹配（區分大小寫）
- [ ] GitHub Actions workflow 運行成功
- [ ] Cloudflare Pages 部署成功

## ⚠️ 重要提醒

### Secret 名稱必須完全匹配

- ✅ 正確：`CLOUDFLARE_API_TOKEN`
- ❌ 錯誤：`cloudflare_api_token`（小寫）
- ❌ 錯誤：`CLOUDFLARE_API_TOKEN_`（多餘字符）

### 如果部署失敗

1. **檢查 GitHub Actions 日誌**
   - https://github.com/dannykan/prediction-web/actions
   - 點擊失敗的 workflow run
   - 查看錯誤訊息

2. **常見錯誤**
   - `Error: Input required and not supplied: apiToken`
     - → Secret 名稱不匹配或未設置
   - `Error: Authentication failed`
     - → API Token 無效或過期
   - `Error: Account not found`
     - → Account ID 錯誤

3. **重新創建 Secrets**
   - 如果 Secret 名稱不匹配，刪除舊的並重新創建
   - 確保名稱完全匹配

## 🎉 完成後

設置完成後，每次推送代碼到 `main` 分支時：

1. GitHub Actions 會自動觸發
2. 在 GitHub 服務器上構建 Next.js 應用
3. 使用 Wrangler CLI 部署到 Cloudflare Pages
4. 更新 `https://predictiongod.app`

---

## 🔄 兩種部署方式對比

### 方式 1: Cloudflare 自動構建
- Cloudflare 直接連接 GitHub
- 構建在 Cloudflare 服務器上執行
- 不需要 GitHub Actions
- 不需要配置 GitHub Secrets

### 方式 2: GitHub Actions 部署（你記得的方式）✅
- 使用 GitHub Actions workflow
- 構建在 GitHub 服務器上執行
- 需要配置 GitHub Secrets
- 可以使用 GitHub Actions 的更多功能

**建議**：如果已經配置了 GitHub Actions workflow，使用方式 2 即可！
