# Figma 組件索引

快速查找 Figma 專案中可用的 UI 組件。

## 📄 頁面組件

所有頁面組件位於：`src/app/pages/`

| 組件 | 路徑 | 用途 | 對應主專案路由 |
|------|------|------|---------------|
| `HomePage.tsx` | `pages/HomePage.tsx` | 首頁（市場列表） | `/home` |
| `MarketDetail.tsx` | `pages/MarketDetail.tsx` | 市場詳情頁 | `/m/[id]` |
| `Profile.tsx` | `pages/Profile.tsx` | 個人資料頁 | `/profile` |
| `Leaderboard.tsx` | `pages/Leaderboard.tsx` | 排行榜 | `/leaderboard` |
| `CreateQuestion.tsx` | `pages/CreateQuestion.tsx` | 創建問題 | `/create-question` |
| `Quests.tsx` | `pages/Quests.tsx` | 任務系統 | `/quests` |
| `Notifications.tsx` | `pages/Notifications.tsx` | 通知中心 | `/notifications` |
| `Referrals.tsx` | `pages/Referrals.tsx` | 推薦系統 | `/referrals` |

## 🧩 業務組件

### 市場相關

| 組件 | 路徑 | 用途 |
|------|------|------|
| `MarketCard.tsx` | `components/MarketCard.tsx` | 市場卡片（標準版） |
| `MarketCardWide.tsx` | `components/MarketCardWide.tsx` | 市場卡片（寬版） |
| `CategoryFilter.tsx` | `components/CategoryFilter.tsx` | 分類篩選器 |
| `MarketFilter.tsx` | `components/MarketFilter.tsx` | 市場篩選器 |
| `SearchBar.tsx` | `components/SearchBar.tsx` | 搜尋欄 |

### 市場詳情相關

位於：`components/market-detail/`

| 組件 | 路徑 | 用途 |
|------|------|------|
| `LmsrTradingCard.tsx` | `market-detail/LmsrTradingCard.tsx` | LMSR 交易卡片 |
| `ProbabilityChart.tsx` | `market-detail/ProbabilityChart.tsx` | 機率圖表 |
| `CommentsSection.tsx` | `market-detail/CommentsSection.tsx` | 評論區 |
| `TradeHistorySection.tsx` | `market-detail/TradeHistorySection.tsx` | 交易歷史 |
| `BetIcon.tsx` | `market-detail/BetIcon.tsx` | 下注圖標 |

### 個人資料相關

位於：`components/profile/`

| 組件 | 路徑 | 用途 |
|------|------|------|
| `ProfileOverview.tsx` | `profile/ProfileOverview.tsx` | 個人資料概覽 |
| `ProfilePositions.tsx` | `profile/ProfilePositions.tsx` | 持倉列表 |
| `ProfileTransactions.tsx` | `profile/ProfileTransactions.tsx` | 交易記錄 |
| `ProfileComments.tsx` | `profile/ProfileComments.tsx` | 評論列表 |

### 布局組件

| 組件 | 路徑 | 用途 |
|------|------|------|
| `Sidebar.tsx` | `components/Sidebar.tsx` | 側邊欄（桌面版） |
| `MobileHeader.tsx` | `components/MobileHeader.tsx` | 行動版標題列 |
| `MobileUserStats.tsx` | `components/MobileUserStats.tsx` | 行動版用戶統計 |
| `UserInfoCard.tsx` | `components/UserInfoCard.tsx` | 用戶資訊卡片 |

### 功能組件

| 組件 | 路徑 | 用途 |
|------|------|------|
| `PullToRefresh.tsx` | `components/PullToRefresh.tsx` | 下拉刷新 |
| `SEOHead.tsx` | `components/SEOHead.tsx` | SEO 標籤 |
| `ImageWithFallback.tsx` | `components/figma/ImageWithFallback.tsx` | 圖片容錯處理 |

## 🎨 UI 基礎組件庫

位於：`components/ui/`

完整的 shadcn/ui 風格組件庫，包含：

### 表單組件
- `button.tsx` - 按鈕
- `input.tsx` - 輸入框
- `textarea.tsx` - 多行輸入
- `select.tsx` - 下拉選單
- `checkbox.tsx` - 複選框
- `radio-group.tsx` - 單選按鈕組
- `switch.tsx` - 開關
- `slider.tsx` - 滑桿
- `form.tsx` - 表單容器
- `label.tsx` - 標籤

### 顯示組件
- `card.tsx` - 卡片
- `badge.tsx` - 徽章
- `avatar.tsx` - 頭像
- `separator.tsx` - 分隔線
- `skeleton.tsx` - 骨架屏
- `progress.tsx` - 進度條
- `chart.tsx` - 圖表容器

### 互動組件
- `dialog.tsx` - 對話框
- `alert-dialog.tsx` - 確認對話框
- `sheet.tsx` - 側邊抽屜
- `drawer.tsx` - 底部抽屜
- `popover.tsx` - 彈出框
- `tooltip.tsx` - 工具提示
- `hover-card.tsx` - 懸停卡片
- `context-menu.tsx` - 右鍵選單
- `dropdown-menu.tsx` - 下拉選單
- `menubar.tsx` - 選單列

### 導航組件
- `tabs.tsx` - 標籤頁
- `accordion.tsx` - 手風琴
- `collapsible.tsx` - 可摺疊
- `breadcrumb.tsx` - 麵包屑
- `navigation-menu.tsx` - 導航選單
- `sidebar.tsx` - 側邊欄組件
- `pagination.tsx` - 分頁

### 其他組件
- `alert.tsx` - 警告提示
- `table.tsx` - 表格
- `carousel.tsx` - 輪播圖
- `calendar.tsx` - 日曆
- `command.tsx` - 命令面板
- `resizable.tsx` - 可調整大小面板
- `toggle.tsx` - 切換按鈕
- `toggle-group.tsx` - 切換按鈕組
- `sonner.tsx` - Toast 通知
- `scroll-area.tsx` - 滾動區域
- `aspect-ratio.tsx` - 寬高比容器

### 工具
- `utils.ts` - 工具函數（cn, cva 等）
- `use-mobile.ts` - 行動裝置檢測 Hook

## 📁 樣式文件

位於：`src/styles/`

| 文件 | 用途 |
|------|------|
| `index.css` | 主樣式入口（導入其他樣式） |
| `tailwind.css` | Tailwind CSS 配置 |
| `theme.css` | 主題變數（顏色、字體等） |
| `fonts.css` | 字體配置 |

## 🖼️ 資源文件

位於：`src/assets/`

- `815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png` - G 幣圖標
- `cb592270b53ce2c68c88b8bd344970bda4c7ada6.png` - 其他資源

## 💡 使用建議

1. **先查看頁面組件**：了解整體結構和組件組合方式
2. **參考業務組件**：了解如何實現特定功能
3. **使用 UI 基礎組件**：直接複製到主專案使用（需檢查依賴）
4. **檢查樣式文件**：確保主題變數和 Tailwind 配置一致

## ⚠️ 注意事項

- 所有組件使用 **mock 數據**，需要連接真實 API
- 使用 **React Router**，主專案需改為 Next.js 路由
- 部分依賴可能與主專案不同，需要檢查兼容性
- 樣式使用 **Tailwind CSS 4**，需確認主專案版本
