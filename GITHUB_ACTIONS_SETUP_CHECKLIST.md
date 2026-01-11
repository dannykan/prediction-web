# GitHub Actions 設置檢查清單

## ✅ 已完成

- ✅ GitHub Actions workflow 文件已創建：`.github/workflows/deploy-cloudflare.yml`
- ✅ Workflow 已推送到 GitHub：https://github.com/dannykan/prediction-web

## 🔧 需要設置的 GitHub Secrets

為了讓 GitHub Actions 正常工作，需要在 GitHub 倉庫中設置以下 Secrets：

### 必需 Secrets

1. **CLOUDFLARE_API_TOKEN**
   - 訪問：https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 點擊 "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 你的 Cloudflare API Token（從 https://dash.cloudflare.com/profile/api-tokens 獲取）

2. **CLOUDFLARE_ACCOUNT_ID**
   - 訪問：https://github.com/dannykan/prediction-web/settings/secrets/actions
   - 點擊 "New repository secret"
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `3f788981872971344ab14a8fcafa5c8f`

### 可選 Secrets（推薦設置）

3. **NEXT_PUBLIC_API_BASE_URL**
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://prediction-backend-production-8f6c.up.railway.app`（或你的實際 Railway URL）

4. **NEXT_PUBLIC_SITE_URL**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://predictiongod.app`

## 📋 設置步驟

### 步驟 1: 訪問 GitHub Secrets 設置頁面

```
https://github.com/dannykan/prediction-web/settings/secrets/actions
```

### 步驟 2: 添加 Secrets

按照上面的列表，逐一添加所有 Secrets。

### 步驟 3: 驗證設置

1. **檢查 Secrets 列表**
   - 確認看到所有必需的 Secrets ✅

2. **觸發測試部署**
   - 訪問：https://github.com/dannykan/prediction-web/actions
   - 點擊 "Deploy to Cloudflare Pages" workflow
   - 點擊 "Run workflow" → "Run workflow"
   - 或推送任何更改到 `prediction-web/**` 目錄

3. **查看部署狀態**
   - 在 Actions 頁面查看 workflow 運行狀態
   - 確認部署成功 ✅

## 🔍 檢查 Workflow 是否運行

### 方法 1: 查看 GitHub Actions

1. 訪問：https://github.com/dannykan/prediction-web/actions
2. 查看是否有 "Deploy to Cloudflare Pages" workflow
3. 點擊最新的運行查看詳細信息

### 方法 2: 手動觸發

1. 訪問：https://github.com/dannykan/prediction-web/actions
2. 選擇 "Deploy to Cloudflare Pages" workflow
3. 點擊 "Run workflow" 按鈕
4. 選擇分支（main）
5. 點擊 "Run workflow"

## ⚠️ 常見問題

### 問題 1: Workflow 沒有運行

**可能原因**：
- Secrets 沒有設置
- Workflow 文件路徑不正確
- 推送的文件不在 `prediction-web/**` 路徑下

**解決方法**：
- 確認 Secrets 已設置
- 確認 workflow 文件在 `.github/workflows/deploy-cloudflare.yml`
- 手動觸發 workflow 測試

### 問題 2: Workflow 運行但失敗

**可能原因**：
- Secrets 值不正確
- Cloudflare API Token 無效
- Account ID 錯誤

**解決方法**：
- 檢查 GitHub Actions 日誌
- 確認 Secrets 值正確
- 重新創建 Cloudflare API Token

### 問題 3: 部署成功但網站沒有更新

**可能原因**：
- Cloudflare Pages 快取
- 構建輸出目錄不正確

**解決方法**：
- 檢查 Cloudflare Pages Dashboard
- 確認部署成功
- 清除瀏覽器快取

## ✅ 完成檢查清單

- [ ] GitHub Actions workflow 文件已推送
- [ ] `CLOUDFLARE_API_TOKEN` 已設置
- [ ] `CLOUDFLARE_ACCOUNT_ID` 已設置
- [ ] `NEXT_PUBLIC_API_BASE_URL` 已設置（可選）
- [ ] `NEXT_PUBLIC_SITE_URL` 已設置（可選）
- [ ] Workflow 已運行
- [ ] 部署成功
- [ ] 網站正常訪問

## 🔗 快速鏈接

- **GitHub Secrets**: https://github.com/dannykan/prediction-web/settings/secrets/actions
- **GitHub Actions**: https://github.com/dannykan/prediction-web/actions
- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Pages**: https://dash.cloudflare.com → Pages → predictiongod
