# 快速將 Secrets 複製到 prediction-web 倉庫

## ✅ 已知信息

從 `prediction-app` 倉庫中，我們知道：
- **Cloudflare Account ID**: `3f788981872971344ab14a8fcafa5c8f`

## 🔧 設置步驟

### 步驟 1: 獲取 Cloudflare API Token

由於 GitHub Secrets 無法查看，你需要：

**選項 A：使用現有的 API Token（如果還記得）**
- 如果你還記得之前在 `prediction-app` 中使用的 API Token，可以直接使用

**選項 B：重新創建 API Token（推薦）**
1. 訪問：https://dash.cloudflare.com/profile/api-tokens
2. 查看現有的 Tokens，找到用於 GitHub Actions 的那個
3. 如果找不到或已過期，創建新的：
   - 點擊 **Create Token**
   - 使用模板 **"Edit Cloudflare Workers"**
   - 確保權限：
     - Account > Cloudflare Pages > Edit
     - Account > Account Settings > Read
   - 點擊 **Create Token**
   - **立即複製 Token**（關閉後無法再查看）

### 步驟 2: 在 prediction-web 倉庫設置 Secrets

1. **訪問 GitHub Secrets 設置頁面**
   ```
   https://github.com/dannykan/prediction-web/settings/secrets/actions
   ```

2. **添加第一個 Secret：CLOUDFLARE_API_TOKEN**
   - 點擊 **New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`（必須完全匹配）
   - Secret: 貼上你的 Cloudflare API Token
   - 點擊 **Add secret**

3. **添加第二個 Secret：CLOUDFLARE_ACCOUNT_ID**
   - 點擊 **New repository secret**
   - Name: `CLOUDFLARE_ACCOUNT_ID`（必須完全匹配）
   - Secret: `3f788981872971344ab14a8fcafa5c8f`
   - 點擊 **Add secret**

4. **可選：添加環境變數 Secrets**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

### 步驟 3: 驗證設置

1. **檢查 Secrets 列表**
   - 訪問：https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 確認看到：
     - ✅ `CLOUDFLARE_API_TOKEN`
     - ✅ `CLOUDFLARE_ACCOUNT_ID`

2. **觸發測試部署**
   ```bash
   cd /Users/dannykan/Prediction-God
   git add .
   git commit -m "test: Trigger GitHub Actions deployment"
   git push origin main
   ```

3. **檢查 GitHub Actions**
   - 訪問：https://github.com/dannykan/prediction-web/actions
   - 查看最新的 workflow run
   - 確認部署成功 ✅

## 📋 快速檢查清單

- [ ] 獲取了 Cloudflare API Token
- [ ] 在 `prediction-web` 倉庫設置了 `CLOUDFLARE_API_TOKEN`
- [ ] 在 `prediction-web` 倉庫設置了 `CLOUDFLARE_ACCOUNT_ID` = `3f788981872971344ab14a8fcafa5c8f`
- [ ] 可選：設置了 `NEXT_PUBLIC_API_BASE_URL`
- [ ] 可選：設置了 `NEXT_PUBLIC_SITE_URL`
- [ ] 推送代碼觸發部署
- [ ] 確認 GitHub Actions 部署成功

## 🔗 快速鏈接

- **GitHub Secrets 設置**: https://github.com/dannykan/prediction-web/settings/secrets/actions
- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **GitHub Actions**: https://github.com/dannykan/prediction-web/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com

## ⚠️ 重要提醒

1. **Secret 名稱必須完全匹配**（區分大小寫）：
   - ✅ `CLOUDFLARE_API_TOKEN`
   - ✅ `CLOUDFLARE_ACCOUNT_ID`
   - ❌ 不要使用小寫或其他變體

2. **API Token 安全**：
   - 不要將 Token 提交到代碼庫
   - 如果 Token 洩露，立即在 Cloudflare 中撤銷並重新創建

3. **Account ID 是公開的**：
   - Account ID 不是敏感信息，可以安全使用
