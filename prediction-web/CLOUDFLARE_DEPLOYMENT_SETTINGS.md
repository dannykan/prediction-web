# 🔧 Cloudflare Pages 部署設置指南

## 📊 當前問題

同一個 Git 提交 ID 在 Cloudflare Pages 中出現多次部署，例如：
- `5d4c3af` → 2 個部署
- `cf69e49` → 2 個部署

這會造成：
- ❌ 資源浪費（重複構建）
- ❌ 部署時間延長
- ❌ 難以追蹤哪個是正確的部署

---

## 🔍 原因分析

### 1. Preview Deployments（預覽部署）

Cloudflare Pages 默認為每個 push 創建：
- **Preview deployment** - 帶唯一子域名（如 `96f5931e.predictiongod.pages.dev`）
- **Production deployment** - 主域名（如 `predictiongod.pages.dev`）

### 2. 多個環境

可能同時觸發了：
- Production 環境
- Preview 環境
- 或者多個 branch 的部署

### 3. Webhook 重複觸發

GitHub webhook 可能被觸發多次：
- 網絡問題
- Cloudflare 服務問題
- Webhook 配置錯誤

---

## ✅ 解決方案

### 方案 A: 配置只部署 Production（推薦）

如果你只需要 production 部署，可以關閉 preview 部署：

#### 步驟：

1. **訪問 Cloudflare Pages 設置**
   ```
   https://dash.cloudflare.com/[account]/pages/predictiongod/settings/builds
   ```

2. **找到 "Production branch" 設置**
   ```
   Production branch: main
   ```

3. **配置 "Branch deployments"**

   選項：
   - ✅ **None** - 只部署 production branch（推薦）
   - ⚠️ **All branches** - 為所有分支創建預覽部署
   - ⚠️ **Custom branches** - 為特定分支創建預覽部署

   **推薦設置**: 選擇 **None**

4. **配置 "Deploy Hooks"**

   檢查是否有重複的 deploy hooks：
   ```
   Settings → Builds & deployments → Deploy hooks
   ```

   - 如果有多個 hooks，刪除重複的
   - 只保留必要的 hook

5. **保存設置**

#### 效果：

- ✅ 每次 push 只觸發 1 次 production 部署
- ✅ 不再有 preview 部署
- ✅ 更快的部署速度

---

### 方案 B: 保留 Preview 但區分清楚

如果你需要 preview 部署（用於測試），可以這樣配置：

#### 步驟：

1. **配置 Production branch**
   ```
   Production branch: main
   ```

2. **配置 Preview branches**
   ```
   Branch deployments: Custom branches
   ```

   只為特定分支創建預覽：
   - `dev`
   - `staging`
   - `feature/*`

   **不包括** `main` branch

3. **效果**：
   - `main` branch → 只有 production 部署
   - 其他分支 → preview 部署

---

### 方案 C: 檢查並清理 Webhook

#### 檢查 GitHub Webhooks：

1. 訪問 GitHub 倉庫設置
   ```
   https://github.com/dannykan/prediction-web/settings/hooks
   ```

2. 查看所有 webhooks

3. **檢查是否有重複**：
   - 應該只有 1 個指向 Cloudflare Pages 的 webhook
   - URL 類似：`https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...`

4. **如果有重複**：
   - 刪除重複的 webhooks
   - 只保留一個

5. **測試**：
   - 推送一個新提交
   - 檢查是否只有一次部署

---

## 📋 推薦配置

### 最佳實踐設置

```yaml
# Cloudflare Pages 設置

Production:
  Branch: main
  Build command: npm run build:cloudflare
  Build output directory: .open-next
  Root directory: prediction-web

Branch deployments: None  # 關鍵設置！

Environment variables:
  NODE_VERSION: 20
  NEXT_PUBLIC_API_BASE_URL: https://prediction-backend-production-8f6c.up.railway.app
  NEXT_PUBLIC_SITE_URL: https://predictiongod.pages.dev
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: [your-client-id]

Deploy hooks:
  - [只保留一個必要的 hook]
```

### 為什麼這樣配置？

1. **Branch deployments: None**
   - ✅ 避免為每個 push 創建 preview 部署
   - ✅ 減少資源使用
   - ✅ 更快的部署速度
   - ✅ 更清晰的部署歷史

2. **只部署 main branch**
   - ✅ 確保 production 環境穩定
   - ✅ 避免意外的 preview 部署

3. **單一 webhook**
   - ✅ 避免重複觸發
   - ✅ 更可靠的部署

---

## 🔍 診斷當前配置

### 檢查步驟

1. **查看 Cloudflare Pages 設置**
   ```
   Settings → Builds & deployments
   ```

   檢查：
   - [ ] Production branch 是否設置為 `main`
   - [ ] Branch deployments 設置是什麼？
   - [ ] Deploy hooks 數量（應該只有 0-1 個）

2. **查看部署日誌**

   檢查重複部署的觸發來源：
   - `github:push` - GitHub push 觸發
   - `manual` - 手動觸發
   - `deploy_hook` - Deploy hook 觸發
   - `retry` - 自動重試

3. **檢查 GitHub Webhook**

   訪問：`https://github.com/dannykan/prediction-web/settings/hooks`

   檢查：
   - [ ] 有多少個 Cloudflare webhooks？
   - [ ] 每個 webhook 的狀態（綠色勾選 = 正常）
   - [ ] Recent Deliveries 是否有重複

---

## 🎯 快速修復指南

### 如果現在就想修復重複部署

#### 選項 1: 關閉 Preview Deployments（最簡單）

1. 訪問 Cloudflare Dashboard
2. Pages → predictiongod → Settings
3. Builds & deployments → Branch deployments
4. 選擇 **"None"**
5. 保存

**效果**: 立即生效，下次 push 只會有 1 個部署

#### 選項 2: 清理 Deploy Hooks

1. 訪問 Cloudflare Dashboard
2. Pages → predictiongod → Settings
3. Builds & deployments → Deploy hooks
4. 刪除所有不必要的 hooks
5. 訪問 GitHub Settings → Webhooks
6. 刪除重複的 Cloudflare webhooks

**效果**: 下次 push 應該只有 1 個部署

---

## 📊 部署類型解釋

### Production Deployment

- **URL**: `predictiongod.pages.dev`
- **觸發**: Push 到 `main` branch
- **用途**: 生產環境，用戶訪問的版本
- **數量**: 每次 push 應該只有 **1 個**

### Preview Deployment

- **URL**: `[hash].predictiongod.pages.dev`（唯一子域名）
- **觸發**: Push 到任何 branch（如果啟用）
- **用途**: 測試、預覽、PR review
- **數量**: 可以有多個（每個 branch 一個）

### 當前問題

從你的截圖看：
- `5d4c3af` 有 2 個部署
- 可能是：
  1. 一個 **production** 部署（`b8de5ab1.predictiongod.pages.dev`）
  2. 一個 **preview** 部署（`96f5931e.predictiongod.pages.dev`）

或者：
- Webhook 被觸發了 2 次
- Cloudflare 自動重試了失敗的部署

---

## 🔄 理想的部署流程

### 應該是這樣：

```
Git Push (main branch)
     ↓
GitHub Webhook 觸發
     ↓
Cloudflare Pages 接收
     ↓
創建 1 個 Production Deployment
     ↓
構建成功
     ↓
部署到 predictiongod.pages.dev
```

### 而不是：

```
Git Push (main branch)
     ↓
GitHub Webhook 觸發 2 次（❌ 問題）
     ↓
Cloudflare Pages 接收 2 次
     ↓
創建 2 個 Deployment（❌ 重複）
     ↓
兩個都構建（❌ 浪費資源）
```

---

## 🛠️ 故障排除

### 如果設置後仍有重複部署

1. **檢查 Recent Deliveries**

   GitHub Webhooks → 點擊 Cloudflare webhook → Recent Deliveries

   查看：
   - 每次 push 是否觸發了多次？
   - Response 狀態碼是什麼？

2. **檢查 Cloudflare 日誌**

   Cloudflare Pages → 部署列表

   查看重複部署的：
   - Source（來源）
   - 觸發時間
   - 是否是同一個 commit？

3. **臨時禁用自動部署**

   如果問題持續：
   ```
   Settings → Builds & deployments
   → Pause automatic deployments
   ```

   然後：
   - 修復 webhook 配置
   - 清理重複的 hooks
   - 重新啟用自動部署

---

## 📈 監控部署

### 確認修復成功

修改設置後，推送一個測試提交：

```bash
echo "# Test deployment" >> prediction-web/test.txt
git add prediction-web/test.txt
git commit -m "test: Verify single deployment"
git push origin main
```

然後檢查 Cloudflare Pages：
- ✅ 應該只有 **1 個**新部署
- ✅ 不應該有 preview 部署
- ✅ 部署狀態應該是 "Success"

---

## 💡 額外建議

### 1. 使用環境變量區分 Preview 和 Production

如果你決定保留 preview 部署，可以設置不同的環境變量：

**Production**:
```
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app
NEXT_PUBLIC_SITE_URL=https://predictiongod.pages.dev
```

**Preview**:
```
NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-staging.up.railway.app
NEXT_PUBLIC_SITE_URL=https://preview.predictiongod.pages.dev
```

### 2. 設置通知

配置 Cloudflare Pages 通知：
```
Settings → Notifications
```

當部署失敗或成功時發送通知到：
- Email
- Slack
- Discord
- Webhook

### 3. 定期清理舊部署

Cloudflare Pages 會保留所有部署歷史。定期清理舊的 preview 部署：
```
Deployments → 選擇舊部署 → Delete
```

---

## 🎉 總結

### 推薦配置

1. **關閉 Preview Deployments**
   - Branch deployments: None

2. **只保留一個 Webhook**
   - 檢查並刪除重複的 GitHub webhooks

3. **監控部署**
   - 確保每次 push 只有 1 個部署

### 預期結果

- ✅ 每次 Git push 只有 1 個部署
- ✅ 更快的部署速度
- ✅ 更清晰的部署歷史
- ✅ 更少的資源使用

---

## 📞 需要幫助？

如果設置後仍有問題，提供以下信息：

1. Cloudflare Pages 的 "Branch deployments" 設置截圖
2. GitHub Webhooks 列表截圖
3. 最近幾次部署的截圖（顯示觸發來源）

這樣我可以幫你精確診斷問題所在。
