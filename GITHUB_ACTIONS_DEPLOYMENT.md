# GitHub Actions 部署到 Cloudflare Pages 指南

## 🎯 兩種部署方式

Cloudflare Pages 支持兩種部署方式：

### 方式 1: Cloudflare 自動構建（當前使用）
- Cloudflare 直接連接到 GitHub 倉庫
- Cloudflare 自動檢測推送並構建
- 構建在 Cloudflare 的服務器上執行
- 不需要 GitHub Actions

### 方式 2: GitHub Actions 部署（你記得的方式）
- 使用 GitHub Actions workflow
- 構建在 GitHub 的服務器上執行
- 使用 Wrangler CLI 部署到 Cloudflare Pages
- 需要配置 GitHub Secrets

## 📋 你目前的設置

你已經有 GitHub Actions workflow 文件：
- `.github/workflows/deploy-cloudflare.yml`

但是，**如果 Cloudflare Pages 已經直接連接到 GitHub 倉庫**，Cloudflare 會自動構建，不需要 GitHub Actions。

## 🔄 選擇部署方式

### 使用方式 1（Cloudflare 自動構建）- 推薦

**優點**：
- ✅ 設置簡單
- ✅ Cloudflare 自動處理構建
- ✅ 不需要配置 GitHub Secrets
- ✅ 可以在 Cloudflare Dashboard 查看構建日誌

**設置步驟**：
1. 在 Cloudflare Pages 中連接 GitHub 倉庫
2. 設置構建配置（包括 Root directory）
3. 推送代碼，Cloudflare 自動構建和部署

### 使用方式 2（GitHub Actions 部署）

**優點**：
- ✅ 構建在 GitHub 上執行
- ✅ 可以使用 GitHub Actions 的更多功能
- ✅ 可以自定義構建流程

**設置步驟**：
1. 配置 GitHub Secrets
2. 確保 workflow 文件正確
3. 推送代碼，GitHub Actions 自動構建和部署

## 🔧 如果你想使用 GitHub Actions 部署

### 步驟 1: 配置 GitHub Secrets

1. **訪問 GitHub 倉庫**
   - https://github.com/dannykan/prediction-web
   - Settings → Secrets and variables → Actions

2. **添加以下 Secrets**：

   **CLOUDFLARE_API_TOKEN**：
   - 訪問 https://dash.cloudflare.com/profile/api-tokens
   - Create Token
   - 使用模板 "Edit Cloudflare Workers"
   - 或自定義權限：
     - Account > Cloudflare Pages > Edit
     - Account > Account Settings > Read
   - 複製生成的 Token

   **CLOUDFLARE_ACCOUNT_ID**：
   - 訪問 https://dash.cloudflare.com
   - 在右側可以看到 Account ID
   - 複製 Account ID

   **可選：NEXT_PUBLIC_API_BASE_URL**：
   - 值：`https://prediction-backend-production-8f6c.up.railway.app`

   **可選：NEXT_PUBLIC_SITE_URL**：
   - 值：`https://predictiongod.app`

### 步驟 2: 確認 Workflow 文件

檢查 `.github/workflows/deploy-cloudflare.yml` 是否正確：

- ✅ 觸發條件：push 到 main 分支
- ✅ 構建命令：在 `prediction-web` 目錄中執行
- ✅ 專案名稱：`predictiongod`
- ✅ 輸出目錄：`prediction-web/.next`

### 步驟 3: 推送代碼觸發部署

```bash
cd /Users/dannykan/Prediction-God
git add .
git commit -m "trigger: GitHub Actions deployment"
git push origin main
```

### 步驟 4: 檢查部署狀態

1. **GitHub Actions**：
   - https://github.com/dannykan/prediction-web/actions
   - 查看最新的 workflow run

2. **Cloudflare Pages**：
   - https://dash.cloudflare.com
   - Pages → predictiongod → Deployments

## ⚠️ 重要提醒

### 如果 Cloudflare Pages 已經直接連接到 GitHub

- Cloudflare 會自動構建（即使沒有 GitHub Actions）
- 如果同時使用 GitHub Actions，可能會**重複部署**
- 建議選擇一種方式：
  - **方式 1**：使用 Cloudflare 自動構建（在 Cloudflare 設置中配置 Root directory）
  - **方式 2**：使用 GitHub Actions（禁用 Cloudflare 的自動構建）

### 禁用 Cloudflare 自動構建（如果使用 GitHub Actions）

1. Cloudflare Dashboard → Pages → predictiongod
2. Settings → Builds & deployments
3. 找到 "Automatic builds" 或類似設置
4. 禁用自動構建

---

## 💡 我的建議

**使用方式 1（Cloudflare 自動構建）**，因為：
- ✅ 設置更簡單
- ✅ 不需要配置 GitHub Secrets
- ✅ 構建日誌在 Cloudflare 中更容易查看
- ✅ 這是 Cloudflare Pages 的標準方式

**如果需要使用 GitHub Actions**，確保：
- ✅ 配置了 GitHub Secrets
- ✅ 禁用了 Cloudflare 的自動構建
- ✅ Workflow 文件正確配置

---

## 🔍 檢查當前設置

### 檢查 Cloudflare 是否已連接 GitHub

1. Cloudflare Dashboard → Pages → predictiongod
2. Settings → Integrations → GitHub
3. 查看是否已連接倉庫

### 檢查 GitHub Actions 狀態

1. https://github.com/dannykan/prediction-web/actions
2. 查看是否有 workflow runs
3. 如果失敗，檢查錯誤訊息

---

你想使用哪種方式？我可以幫你設置！
