# GitHub Actions 故障排除指南

## 🔍 問題診斷

如果 GitHub Actions 沒有自動執行部署，請檢查以下幾點：

### 1. Workflow 文件位置

確認 workflow 文件在正確的位置：
- ✅ 應該在：`.github/workflows/deploy-cloudflare.yml`（根目錄）
- ❌ 不應該在：`prediction-web/.github/workflows/deploy-cloudflare.yml`

### 2. Paths 過濾器問題

Workflow 中的 `paths` 過濾器可能會阻止觸發：

```yaml
on:
  push:
    branches: [main, master]
    paths:
      - 'prediction-web/**'
      - '.github/workflows/deploy-cloudflare.yml'  # 添加這行很重要
```

**問題**：如果只有 `prediction-web/**`，那麼當你：
- 添加 workflow 文件本身時，不會觸發
- 只修改根目錄文件時，不會觸發

**解決方法**：確保 workflow 文件本身也在 paths 中。

### 3. GitHub Secrets 設置

確認所有必需的 Secrets 都已設置：

**必需**：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

**可選（推薦）**：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`

檢查位置：https://github.com/dannykan/prediction-web/settings/secrets/actions

### 4. 檢查 Workflow 是否觸發

1. **訪問 GitHub Actions**：
   ```
   https://github.com/dannykan/prediction-web/actions
   ```

2. **查看是否有 workflow runs**：
   - 如果有，點擊查看詳細信息
   - 如果沒有，說明 workflow 沒有被觸發

3. **檢查 workflow 是否顯示**：
   - 在 Actions 頁面左側，應該看到 "Deploy to Cloudflare Pages" workflow
   - 如果沒有看到，說明 workflow 文件可能沒有被正確識別

### 5. 手動觸發測試

1. **訪問 GitHub Actions**：
   ```
   https://github.com/dannykan/prediction-web/actions
   ```

2. **選擇 "Deploy to Cloudflare Pages" workflow**

3. **點擊 "Run workflow" 按鈕**

4. **選擇分支（main）**

5. **點擊 "Run workflow"**

如果手動觸發成功，說明：
- ✅ Workflow 文件正確
- ✅ Secrets 設置正確
- ❌ 只是自動觸發的條件沒有滿足

### 6. 檢查最近的提交

查看最近的提交是否包含 `prediction-web/**` 路徑的文件：

```bash
git log --oneline --name-only -5
```

如果最近的提交都沒有修改 `prediction-web/**` 目錄下的文件，workflow 不會自動觸發。

**解決方法**：
- 推送任何更改到 `prediction-web/**` 目錄
- 或移除 `paths` 過濾器（不推薦，會在所有推送時觸發）

### 7. 移除 Paths 過濾器（如果確實需要）

如果確認問題是 `paths` 過濾器，可以暫時移除：

```yaml
on:
  push:
    branches: [main, master]
    # paths:  # 暫時註釋掉
    #   - 'prediction-web/**'
  workflow_dispatch:
```

**注意**：移除後，所有推送都會觸發 workflow，可能會增加構建次數。

### 8. 檢查 Workflow 語法

確認 workflow 文件的 YAML 語法正確：

```bash
# 使用 GitHub Actions 驗證工具（如果有的話）
# 或使用在線 YAML 驗證工具
```

常見錯誤：
- 縮進不正確
- 缺少必要的欄位
- Secrets 名稱拼寫錯誤

## ✅ 快速檢查清單

- [ ] Workflow 文件在 `.github/workflows/deploy-cloudflare.yml`
- [ ] Workflow 文件已推送到 GitHub
- [ ] `CLOUDFLARE_API_TOKEN` Secret 已設置
- [ ] `CLOUDFLARE_ACCOUNT_ID` Secret 已設置
- [ ] 訪問 https://github.com/dannykan/prediction-web/actions 可以看到 workflow
- [ ] 手動觸發 workflow 測試
- [ ] 檢查最近的提交是否包含 `prediction-web/**` 路徑的文件

## 🔧 建議的解決步驟

1. **確認 workflow 文件已推送**：
   ```bash
   git log --oneline | grep -i workflow
   ```

2. **檢查 GitHub Actions 頁面**：
   - 訪問：https://github.com/dannykan/prediction-web/actions
   - 確認看到 "Deploy to Cloudflare Pages" workflow

3. **手動觸發測試**：
   - 在 Actions 頁面點擊 "Run workflow"
   - 查看是否成功運行

4. **如果手動觸發成功，但自動觸發失敗**：
   - 檢查 `paths` 過濾器
   - 確認最近的提交包含 `prediction-web/**` 路徑的文件
   - 或推送一個測試更改到 `prediction-web/**` 目錄

5. **如果手動觸發也失敗**：
   - 檢查 Secrets 設置
   - 查看 workflow 運行日誌
   - 檢查錯誤訊息

## 🔗 有用的鏈接

- **GitHub Actions**: https://github.com/dannykan/prediction-web/actions
- **GitHub Secrets**: https://github.com/dannykan/prediction-web/settings/secrets/actions
- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Pages**: https://dash.cloudflare.com → Pages → predictiongod
