# Figma React 專案隔離資料夾

## 📦 專案內容

**專案名稱**：中文版未來事件預測平台

**位置**：`/中文版未來事件預測平台/`

**技術棧**：
- Vite + React
- React Router
- Tailwind CSS 4
- Radix UI (shadcn/ui 風格)
- Mock 數據（純 UI 展示）

## 🎯 用途

這個資料夾用於存放從 Figma 匯出的 React 專案原始碼，作為**純 UI component（presentational）**的參考來源。

## 📋 工作流程

### 最終目標
- **主專案保留**：`src/app/pages/*` 的路由/資料/狀態邏輯
- **Figma 專案提供**：頁面 UI component（presentational）
- **套版順序**：先能看到畫面 → 再接資料 → 再抽共用元件

### 使用方式
1. ✅ Figma 匯出的 React 專案已放在此資料夾
2. ✅ 保留原始碼以便比對
3. ✅ 不會污染主程式（`prediction-web/`）
4. ✅ 方便 Cursor 比對/搬運，避免亂改

## 📄 相關文件

- **[整合計劃](./INTEGRATION_PLAN.md)** - 詳細的整合策略和步驟
- **[Figma 專案 README](./中文版未來事件預測平台/README.md)** - 原始專案說明

## ⚠️ 注意事項

- ⚠️ 此資料夾的內容**僅供參考**，不要直接在主專案中使用
- ✅ 從這裡提取 UI component 時，需要：
  1. **先套版**（能看到畫面）
  2. **再接資料**（連接 `src/app/pages/*` 的邏輯）
  3. **再抽共用元件**（重構優化）

## 🚀 快速開始

1. 查看 [整合計劃](./INTEGRATION_PLAN.md) 了解整體策略
2. 選擇一個頁面開始整合（建議從 HomePage 開始）
3. 按照三步驟進行：套版 → 接資料 → 抽共用元件
