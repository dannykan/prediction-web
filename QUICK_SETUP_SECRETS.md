# 快速設置 GitHub Secrets - prediction-web

## 🎯 目標

在 `prediction-web` 倉庫中設置 GitHub Secrets，讓 GitHub Actions 可以自動部署到 Cloudflare Pages。

## ✅ 需要設置的 Secrets（只有 2 個）

1. **CLOUDFLARE_API_TOKEN** - Cloudflare API Token
2. **CLOUDFLARE_ACCOUNT_ID** - Cloudflare Account ID（已知：`3f788981872971344ab14a8fcafa5c8f`）

> **注意**：Zone ID 不需要！Zone ID 只用於清除快取，Pages 部署不需要。

## 🚀 快速設置步驟（約 3 分鐘）

### 步驟 1: 獲取 Cloudflare API Token

1. **訪問**：https://dash.cloudflare.com/profile/api-tokens

2. **使用模板創建**（推薦）：
   - 在 **API token templates** 區域找到 **"Edit Cloudflare Workers"**
   - 點擊 **"Use template"**
   - 確認權限已勾選
   - 點擊 **"Create Token"**
   - **立即複製 Token**（重要！）

### 步驟 2: 在 GitHub 設置 Secrets

1. **訪問**：https://github.com/dannykan/prediction-web/settings/secrets/actions

2. **添加兩個 Secrets**：

   **Secret 1**:
   - 點擊 **"New repository secret"**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: [貼上你的 API Token]
   - 點擊 **"Add secret"**

   **Secret 2**:
   - 點擊 **"New repository secret"**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: `3f788981872971344ab14a8fcafa5c8f`
   - 點擊 **"Add secret"**

### 步驟 3: 驗證

1. **檢查 Secrets**：
   - 訪問：https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 確認看到兩個 Secrets ✅

2. **觸發部署**：
   ```bash
   git push origin main
   ```

3. **查看部署狀態**：
   - https://github.com/dannykan/prediction-web/actions

## ❓ Zone ID 相關問題

**Q: 需要 Zone ID 嗎？**
A: 不需要。Zone ID 只用於清除快取，Cloudflare Pages 部署不需要。

**Q: 如果我想清除快取怎麼辦？**
A: Cloudflare Pages 的快取管理是自動的，通常不需要手動清除。如果確實需要，可以在 Cloudflare Dashboard 的域名頁面找到 Zone ID。

## 📋 檢查清單

- [ ] 創建了 Cloudflare API Token
- [ ] 設置了 `CLOUDFLARE_API_TOKEN`
- [ ] 設置了 `CLOUDFLARE_ACCOUNT_ID`
- [ ] 推送代碼測試部署
- [ ] 確認部署成功

## 🔗 快速鏈接

- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **GitHub Secrets**: https://github.com/dannykan/prediction-web/settings/secrets/actions
- **GitHub Actions**: https://github.com/dannykan/prediction-web/actions
