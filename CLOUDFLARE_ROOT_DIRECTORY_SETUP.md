# Cloudflare Pages Root Directory 設置指南

## 📍 設置位置

### 步驟 1: 進入 Cloudflare Dashboard

1. 訪問 https://dash.cloudflare.com
2. 登入你的帳號

### 步驟 2: 找到 Pages 專案

1. **在左側導航欄**：
   - 找到 **"Build"** 或 **"Compute & AI"** 部分
   - 點擊 **"Workers & Pages"**

2. **或者直接訪問**：
   - https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod

### 步驟 3: 進入專案設置

1. **找到 `predictiongod` 專案**
   - 在 Pages 專案列表中
   - 點擊 `predictiongod` 專案名稱

2. **進入 Settings**
   - 點擊頂部導航欄的 **"Settings"** 標籤
   - 或直接訪問：https://dash.cloudflare.com/3f788981872971344ab14a8fcafa5c8f/workers-and-pages/pages/predictiongod/settings

### 步驟 4: 找到 Builds & deployments 設置

1. **在 Settings 頁面中**
   - 向下滾動找到 **"Builds & deployments"** 部分
   - 或點擊左側設置菜單中的 **"Builds & deployments"**

2. **你會看到以下設置選項**：
   - Framework preset
   - Root directory ⬅️ **這裡！**
   - Build command
   - Build output directory
   - Environment variables

### 步驟 5: 設置 Root directory

1. **找到 "Root directory" 欄位**
2. **輸入**：`prediction-web`
3. **同時更新其他設置**：
   - **Build command**: `cd prediction-web && npm install && npm run build`
   - **Build output directory**: `prediction-web/.next`
   - **Framework preset**: `Next.js`
   - **Node version**: `18` 或更高

4. **點擊 "Save"** 保存設置

---

## 🎯 完整設置清單

在 **Settings → Builds & deployments** 中，設置以下內容：

| 設置項 | 值 |
|--------|-----|
| **Framework preset** | `Next.js` |
| **Root directory** | `/prediction-web` |
| **Build command** | `cd prediction-web && npm install && npm run build` |
| **Build output directory** | `prediction-web/.next` |
| **Node version** | `18` 或更高 |

---

## 📸 視覺指引

設置路徑：
```
Cloudflare Dashboard
└── Workers & Pages
    └── Pages
        └── predictiongod (專案)
            └── Settings
                └── Builds & deployments
                    └── Root directory ⬅️ 在這裡設置
```

---

## ⚠️ 重要提醒

1. **Root directory 必須是相對路徑**
   - ✅ 正確：`prediction-web`
   - ❌ 錯誤：`/prediction-web`（不要前導斜線）

2. **保存後需要重新部署**
   - 設置保存後，Cloudflare 會自動觸發新的部署
   - 或手動觸發：Deployments → Create deployment

3. **確認 GitHub 連接**
   - Settings → Integrations → GitHub
   - 確認連接的是 `dannykan/prediction-web` 倉庫

---

## ✅ 驗證設置

設置完成後：

1. **檢查構建日誌**
   - Deployments → 最新部署 → 查看日誌
   - 確認構建命令正確執行
   - 確認找到 `prediction-web` 目錄

2. **檢查部署結果**
   - 訪問 https://predictiongod.app
   - 確認頁面正常載入（Next.js 版本）

---

## 🆘 如果找不到設置

### 方法 1: 使用搜索

在 Cloudflare Dashboard 頂部搜索框：
- 輸入 "Builds" 或 "deployments"
- 選擇相關結果

### 方法 2: 直接 URL

如果知道你的 Account ID，可以直接訪問：
```
https://dash.cloudflare.com/{ACCOUNT_ID}/workers-and-pages/pages/predictiongod/settings
```

### 方法 3: 重新創建專案

如果找不到設置，可以：
1. 創建新專案
2. 連接 GitHub 倉庫 `dannykan/prediction-web`
3. 在創建時設置 Root directory 為 `prediction-web`

---

完成設置後，Cloudflare Pages 會從 `prediction-web` 目錄構建 Next.js 應用！
