# Figma UI 整合檢查清單

## ✅ 整合每個新頁面時必須完成的步驟

### Step 1: 創建 UI 組件
- [ ] 創建 `{PageName}UI.tsx` 在 `src/components/figma/`
- [ ] 創建 `{PageName}UIClient.tsx` 在 `src/components/figma/`
- [ ] 移植 Figma 的 UI 組件（如需要）

### Step 2: 連接數據
- [ ] 在 `{PageName}UIClient.tsx` 中連接真實 API
- [ ] 處理用戶認證和狀態
- [ ] 處理錯誤和載入狀態

### Step 3: 整合到主專案
- [ ] 更新主專案的 `page.tsx` 使用新的 UI 組件
- [ ] 保留所有現有的數據獲取邏輯
- [ ] 保留 SEO 和結構化數據

### Step 4: ⚠️ **重要：更新 Layout 配置**
- [ ] 在 `src/app/(public)/ConditionalLayout.tsx` 中添加新頁面路徑
  - 如果是靜態路徑：添加到 `FIGMA_UI_PAGES` 數組
  - 如果是動態路由：添加到 `FIGMA_UI_PATTERNS` 數組
- [ ] 更新 `FIGMA_UI_PAGES.md` 文檔

### Step 5: 測試
- [ ] 確認新頁面不顯示舊的 Navbar 和 BottomNavigation
- [ ] 確認響應式設計正常（手機版和電腦版）
- [ ] 確認所有功能正常工作

## 📋 已整合的頁面

| 頁面 | 路由 | Layout 配置 | 狀態 |
|------|------|------------|------|
| HomePage | `/home`, `/` | ✅ 已配置 | ✅ 完成 |
| MarketDetail | `/m/[id]` | ✅ 已配置 | ✅ 完成 |

## 🔄 待整合的頁面

| 頁面 | 路由 | 預期配置方式 |
|------|------|------------|
| Profile | `/profile` | 添加到 `FIGMA_UI_PAGES` |
| Leaderboard | `/leaderboard` | 添加到 `FIGMA_UI_PAGES` |
| CreateQuestion | `/create-question` | 添加到 `FIGMA_UI_PAGES` |
| Quests | `/quests` | 添加到 `FIGMA_UI_PAGES` |
| Notifications | `/notifications` | 添加到 `FIGMA_UI_PAGES` |
| Referrals | `/referrals` | 添加到 `FIGMA_UI_PAGES` |

## 📝 配置範例

### 靜態路徑
```typescript
const FIGMA_UI_PAGES = [
  "/home",
  "/",
  "/profile",      // 整合後添加
  "/leaderboard", // 整合後添加
];
```

### 動態路由
```typescript
const FIGMA_UI_PATTERNS = [
  /^\/m\/[^/]+$/, // /m/[id] - MarketDetail
];
```

## ⚠️ 重要提醒

**每次整合新頁面時，必須更新 `ConditionalLayout.tsx`！**

否則新頁面會顯示舊的 Navbar 和 BottomNavigation，破壞 Figma UI 的設計。
