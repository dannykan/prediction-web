# Cloudflare Worker 大小限制解決方案

## 問題

部署時遇到錯誤：
```
Error: Failed to publish your Function. Got error: Your Worker exceeded the size limit of 3 MiB. 
Please upgrade to a paid plan to deploy Workers up to 10 MiB.
```

## 原因

Next.js 應用編譯後的 Worker 文件超過了 Cloudflare 免費計劃的 3 MiB 限制。

## 解決方案

### 方案 1：升級到 Cloudflare 付費計劃（推薦）

**步驟：**
1. 訪問 Cloudflare Dashboard：https://dash.cloudflare.com
2. 進入 Workers & Pages 設置
3. 升級到 **Workers Paid Plan**（$5 USD/月）
4. 升級後，Worker 大小限制將提升到 **10 MiB**

**優點：**
- 最簡單直接的解決方案
- 立即解決問題
- 還包括其他好處（更高的請求限制、Workers KV、Durable Objects 等）

**升級鏈接：**
- https://dash.cloudflare.com/workers/plans
- 或訪問：https://developers.cloudflare.com/workers/platform/pricing/

### 方案 2：優化 Bundle 大小（已實施）

已添加以下優化配置：

1. **Next.js 配置優化** (`next.config.ts`)
   - 啟用 `optimizePackageImports` 用於大型庫（lucide-react, recharts, date-fns）
   - 啟用 SWC minify
   - 啟用壓縮

2. **代碼優化建議**
   - 使用動態導入（`dynamic import`）加載大型組件
   - 移除未使用的依賴
   - 考慮代碼分割

### 方案 3：檢查當前 Worker 大小

在本地構建後，可以檢查 Worker 大小：

```bash
cd prediction-web
npm run build:cloudflare
ls -lh .open-next/_worker.js
```

## 當前狀態

- ✅ 已添加 bundle 優化配置
- ⚠️ 如果仍然超過 3 MiB，需要升級到付費計劃

## 下一步

1. **立即解決**：升級到 Cloudflare 付費計劃（$5/月）
2. **長期優化**：繼續優化代碼，減少 bundle 大小

## 參考資料

- [Cloudflare Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers 定價](https://developers.cloudflare.com/workers/platform/pricing/)
