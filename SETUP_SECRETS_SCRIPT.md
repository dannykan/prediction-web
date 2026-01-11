# 自動化設置 GitHub Secrets（需要手動操作）

## 🎯 目標

由於 GitHub Secrets 無法通過 API 直接複製，需要手動設置。但我們可以簡化流程。

## 📋 你需要的信息

### 1. Cloudflare Account ID（已知）
```
3f788981872971344ab14a8fcafa5c8f
```

### 2. Cloudflare API Token（需要獲取）

**方法 1：查看現有 Token（如果還記得）**
- 如果你還記得之前在 `prediction-app` 中使用的 Token，可以直接使用

**方法 2：重新創建 Token**
1. 訪問：https://dash.cloudflare.com/profile/api-tokens
2. 查看現有 Tokens
3. 如果找不到，創建新的：
   - 使用模板 "Edit Cloudflare Workers"
   - 權限：Account > Cloudflare Pages > Edit, Account > Account Settings > Read

## 🚀 快速設置步驟

### 一次性操作（約 2 分鐘）

1. **打開 GitHub Secrets 設置頁面**
   ```
   https://github.com/dannykan/prediction-web/settings/secrets/actions
   ```

2. **添加兩個 Secrets**（複製以下信息）

   **Secret 1**:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [你的 API Token]

   **Secret 2**:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `3f788981872971344ab14a8fcafa5c8f`

3. **可選：添加環境變數**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://prediction-backend-production-8f6c.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://predictiongod.app`

## ✅ 完成後

設置完成後，推送代碼即可自動部署：

```bash
git push origin main
```

GitHub Actions 會自動：
1. 構建 Next.js 應用
2. 部署到 Cloudflare Pages
3. 更新 https://predictiongod.app

## 🔍 驗證

訪問以下鏈接確認：
- **GitHub Actions**: https://github.com/dannykan/prediction-web/actions
- **Cloudflare Pages**: https://dash.cloudflare.com → Pages → predictiongod
