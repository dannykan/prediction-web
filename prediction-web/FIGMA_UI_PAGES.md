# Figma UI 頁面列表

## 📋 說明

這個文件記錄了所有使用 Figma UI 的頁面。這些頁面使用自己的布局（包含 Sidebar、MobileHeader 等），不需要舊的 Navbar 和 BottomNavigation。

## ✅ 已整合的頁面

| 頁面 | 路由 | 狀態 |
|------|------|------|
| HomePage | `/home`, `/` | ✅ 已完成 |
| MarketDetail | `/m/[id]` | ✅ 已完成 |

## 🔄 Layout 處理邏輯

Layout 會自動檢查頁面路徑，如果頁面使用 Figma UI，則跳過舊的 Navbar 和 BottomNavigation。

### 配置位置

- **`src/app/(public)/ConditionalLayout.tsx`** - 條件布局邏輯

### 添加新頁面的步驟

1. 整合 Figma UI 到新頁面（創建 UI 組件和 Client 組件）
2. 在 `ConditionalLayout.tsx` 中添加路徑：
   - 精確匹配：添加到 `FIGMA_UI_PAGES` 數組
   - 動態路由：添加到 `FIGMA_UI_PATTERNS` 數組
3. 更新這個文件記錄新頁面

## 📝 待整合的頁面

| 頁面 | 路由 | 狀態 |
|------|------|------|
| Profile | `/profile` | ⏳ 待整合 |
| Leaderboard | `/leaderboard` | ⏳ 待整合 |
| CreateQuestion | `/create-question` | ⏳ 待整合 |
| Quests | `/quests` | ⏳ 待整合 |
| Notifications | `/notifications` | ⏳ 待整合 |
| Referrals | `/referrals` | ⏳ 待整合 |

## 🎯 整合原則

### 使用 Figma UI 的頁面
- ✅ 使用自己的 Sidebar 和 MobileHeader
- ✅ 使用 PullToRefresh 功能
- ✅ 使用 Figma 設計的樣式和組件
- ❌ 不使用舊的 Navbar 和 BottomNavigation

### 使用舊布局的頁面
- ✅ 使用舊的 Navbar 和 BottomNavigation
- ✅ 保持現有的功能和樣式

## 🔧 技術細節

### 路徑匹配邏輯

1. **精確匹配**（`FIGMA_UI_PAGES`）：
   - 用於靜態路徑，例如：`/home`、`/`

2. **模式匹配**（`FIGMA_UI_PATTERNS`）：
   - 用於動態路由，例如：`/m/[id]` 使用正則表達式 `/^\/m\/[^/]+$/`

### 範例

```typescript
// 精確匹配
const FIGMA_UI_PAGES = [
  "/home",
  "/",
];

// 模式匹配
const FIGMA_UI_PATTERNS = [
  /^\/m\/[^/]+$/, // /m/[id]
  /^\/profile$/,  // /profile（如果整合）
];
```
