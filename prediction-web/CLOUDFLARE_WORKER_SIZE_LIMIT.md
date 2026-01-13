# Cloudflare Worker 大小限制解決方案

## ✅ 問題已解決

**狀態：** 已升級到 Cloudflare Pro 方案，Worker 大小限制已提升至 10 MiB。

## 問題（已解決）

部署時遇到錯誤：
```
Error: Failed to publish your Function. Got error: Your Worker exceeded the size limit of 3 MiB. 
Please upgrade to a paid plan to deploy Workers up to 10 MiB.
```

## 原因

Next.js 應用編譯後的 Worker 文件超過了 Cloudflare 免費計劃的 3 MiB 限制。

## 解決方案（已實施）

### ✅ 方案 1：升級到 Cloudflare Pro 方案（已完成）

**已完成的步驟：**
- ✅ 升級到 **Cloudflare Pro 方案**
- ✅ Worker 大小限制：3 MiB → **10 MiB**
- ✅ 現在可以部署更大的 Worker

**升級後的好處：**
- ✅ Worker 大小限制：10 MiB（足夠應對 Next.js 應用）
- ✅ 更高的請求限制
- ✅ 可以使用 Workers KV、Durable Objects 等功能
- ✅ 更好的性能和可靠性

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

- ✅ 已升級到 Cloudflare Pro 方案
- ✅ Worker 大小限制：10 MiB
- ✅ 已添加 bundle 優化配置
- ✅ 構建配置已修復（移除無效的 Next.js 16 配置選項）

## 下一步

1. **重新部署**：現在可以正常部署了，Worker 大小限制已提升至 10 MiB
2. **驗證部署**：確認部署成功，檢查應用是否正常運行
3. **長期優化**：繼續優化代碼，減少 bundle 大小（雖然現在有 10 MiB 限制，但優化仍然有益）

## 參考資料

- [Cloudflare Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers 定價](https://developers.cloudflare.com/workers/platform/pricing/)
