# Cloudflare API Token 設置指南

## ✅ 需要設置的 Secrets

對於 `prediction-web` 的 GitHub Actions 部署，**只需要兩個 Secrets**：

1. ✅ `CLOUDFLARE_API_TOKEN` - **必需**
2. ✅ `CLOUDFLARE_ACCOUNT_ID` - **必需**（已知：`3f788981872971344ab14a8fcafa5c8f`）
3. ❌ `CLOUDFLARE_ZONE_ID` - **不需要**（Zone ID 只用於清除快取，Pages 部署不需要）

## 🔧 設置 Cloudflare API Token

### 步驟 1: 訪問 API Tokens 頁面

1. 訪問：https://dash.cloudflare.com/profile/api-tokens
2. 你會看到兩個選項：
   - **Custom token**（自定義 Token）
   - **API token templates**（API Token 模板）

### 步驟 2: 選擇創建方式（推薦使用模板）

#### 方式 A：使用模板（推薦）⭐

1. 在 **API token templates** 區域向下滾動
2. 找到 **"Edit Cloudflare Workers"** 模板
3. 點擊右側的 **"Use template"** 按鈕
4. 確認權限：
   - ✅ Account > Cloudflare Pages > Edit
   - ✅ Account > Account Settings > Read
5. 點擊 **"Continue to summary"**
6. 點擊 **"Create Token"**
7. **立即複製 Token**（關閉頁面後無法再查看）
   - Token 格式類似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 保存到安全的地方

#### 方式 B：自定義創建

1. 在 **Custom token** 區域的輸入框中輸入名稱：`github-actions-cloudflare-pages`
2. 點擊 **"Get started"** 按鈕
3. 配置權限：
   - 在 **Permissions** 下拉列表中選擇：
     - Account → Cloudflare Pages → Edit
     - Account → Account Settings → Read
4. **Account Resources**：
   - 選擇你的帳戶
5. 點擊 **"Continue to summary"**
6. 點擊 **"Create Token"**
7. **立即複製 Token**

### 步驟 3: 在 GitHub 設置 Secrets

1. **訪問 GitHub Secrets 設置頁面**
   ```
   https://github.com/dannykan/prediction-web/settings/secrets/actions
   ```

2. **添加第一個 Secret：CLOUDFLARE_API_TOKEN**
   - 點擊 **"New repository secret"**
   - Name: `CLOUDFLARE_API_TOKEN`（必須完全匹配，全大寫）
   - Secret: 貼上步驟 2 獲取的 API Token
   - 點擊 **"Add secret"**

3. **添加第二個 Secret：CLOUDFLARE_ACCOUNT_ID**
   - 點擊 **"New repository secret"**
   - Name: `CLOUDFLARE_ACCOUNT_ID`（必須完全匹配，全大寫）
   - Secret: `3f788981872971344ab14a8fcafa5c8f`
   - 點擊 **"Add secret"**

4. **可選：添加環境變數 Secrets**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

## ❓ 關於 Zone ID

### Zone ID 是什麼？

- Zone ID 是 Cloudflare 中域名的唯一標識符
- 格式類似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 可以在 Cloudflare Dashboard 的域名概覽頁面找到

### 為什麼 prediction-web 不需要 Zone ID？

1. **prediction-app 使用 Zone ID**：
   - 用於清除 Cloudflare CDN 快取（`Purge Cache`）
   - 在 workflow 中有額外的步驟清除快取

2. **prediction-web 不需要 Zone ID**：
   - 使用 `cloudflare/pages-action@v1` 進行部署
   - 這個 action 只需要 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`
   - Cloudflare Pages 的快取管理是自動的，不需要手動清除

### 如果你需要 Zone ID（可選）

雖然不需要，但如果你想清除快取，可以：

1. **查找 Zone ID**：
   - 訪問：https://dash.cloudflare.com
   - 點擊域名 `predictiongod.app`
   - 在右側邊欄可以看到 **Zone ID**

2. **添加到 GitHub Secrets**（可選）：
   - Name: `CLOUDFLARE_ZONE_ID`
   - Value: [你的 Zone ID]

3. **手動清除快取**（如果需要）：
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer {API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```

## ✅ 驗證設置

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

## 📋 完整檢查清單

- [ ] 創建了 Cloudflare API Token（使用 "Edit Cloudflare Workers" 模板）
- [ ] 在 GitHub 設置了 `CLOUDFLARE_API_TOKEN`
- [ ] 在 GitHub 設置了 `CLOUDFLARE_ACCOUNT_ID` = `3f788981872971344ab14a8fcafa5c8f`
- [ ] 可選：設置了 `NEXT_PUBLIC_API_BASE_URL`
- [ ] 可選：設置了 `NEXT_PUBLIC_SITE_URL`
- [ ] 推送代碼觸發部署
- [ ] 確認 GitHub Actions 部署成功

## 🔗 快速鏈接

- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **GitHub Secrets 設置**: https://github.com/dannykan/prediction-web/settings/secrets/actions
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
   - Token 關閉頁面後無法再查看，請妥善保存

3. **Zone ID 不是必需的**：
   - 對於 Cloudflare Pages 部署，不需要 Zone ID
   - 只有在需要手動清除快取時才需要
