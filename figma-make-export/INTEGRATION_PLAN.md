# Figma UI 整合計劃

## 📋 專案對照表

### 頁面對照

| Figma 頁面 | 主專案路由 | 狀態 |
|-----------|-----------|------|
| `HomePage.tsx` | `/home` (`src/app/(public)/home/page.tsx`) | ⏳ 待整合 |
| `MarketDetail.tsx` | `/m/[id]` (`src/app/(public)/m/[id]/page.tsx`) | ⏳ 待整合 |
| `Profile.tsx` | `/profile` (`src/app/(authenticated)/profile/page.tsx`) | ⏳ 待整合 |
| `Leaderboard.tsx` | `/leaderboard` (`src/app/(public)/leaderboard/page.tsx`) | ⏳ 待整合 |
| `CreateQuestion.tsx` | `/create-question` (`src/app/(authenticated)/create-question/page.tsx`) | ⏳ 待整合 |
| `Quests.tsx` | `/quests` (`src/app/(authenticated)/quests/page.tsx`) | ⏳ 待整合 |
| `Notifications.tsx` | `/notifications` (`src/app/(authenticated)/notifications/page.tsx`) | ⏳ 待整合 |
| `Referrals.tsx` | `/referrals` (`src/app/(authenticated)/referrals/page.tsx`) | ⏳ 待整合 |

### 組件對照

#### 已存在的組件（主專案）
- `MarketCard` - 市場卡片
- `LmsrTradingCard` - LMSR 交易卡片
- `CommentsSection` - 評論區
- `TradeHistorySection` - 交易歷史
- `ProbabilityChart` - 機率圖表
- `CategoryFilter` - 分類篩選
- `MarketFilter` - 市場篩選

#### Figma 提供的 UI 組件（純展示）
- `src/app/components/MarketCard.tsx`
- `src/app/components/MarketCardWide.tsx`
- `src/app/components/market-detail/LmsrTradingCard.tsx`
- `src/app/components/market-detail/ProbabilityChart.tsx`
- `src/app/components/market-detail/CommentsSection.tsx`
- `src/app/components/market-detail/TradeHistorySection.tsx`
- `src/app/components/Sidebar.tsx`
- `src/app/components/MobileHeader.tsx`
- `src/app/components/SearchBar.tsx`
- `src/app/components/CategoryFilter.tsx`
- `src/app/components/MarketFilter.tsx`
- `src/app/components/profile/*` - 個人資料相關組件
- `src/app/components/ui/*` - shadcn/ui 組件庫

## 🎯 整合策略：三步驟

### Step 1: 先能看到畫面（套版）
**目標**：將 Figma UI 組件移植到主專案，使用 mock 數據先顯示畫面

**步驟**：
1. 複製 Figma 的 UI 組件到主專案 `src/components/figma/` 資料夾
2. 確保樣式和依賴正確（Tailwind CSS, Radix UI 等）
3. 在 Next.js 頁面中使用這些組件，暫時使用 mock 數據
4. 驗證視覺效果與 Figma 設計一致

**範例**：
```tsx
// src/app/(public)/home/page.tsx
import { HomePageUI } from '@/components/figma/HomePageUI';
import { getMarkets } from '@/features/market/api/getMarkets';

export default async function HomePage() {
  // Step 1: 先用 mock 數據顯示 UI
  const mockMarkets = [...]; // 暫時使用 mock
  
  return <HomePageUI markets={mockMarkets} />;
}
```

### Step 2: 再接資料（連接邏輯）
**目標**：將真實的 API 數據連接到 UI 組件

**步驟**：
1. 將 mock 數據替換為真實的 API 調用
2. 確保數據格式匹配（可能需要適配器函數）
3. 處理 loading 和 error 狀態
4. 連接用戶認證和狀態管理

**範例**：
```tsx
// src/app/(public)/home/page.tsx
import { HomePageUI } from '@/components/figma/HomePageUI';
import { getMarkets } from '@/features/market/api/getMarkets';

export default async function HomePage() {
  // Step 2: 使用真實 API 數據
  const markets = await getMarkets();
  const user = await getMeServer();
  
  return <HomePageUI markets={markets} user={user} />;
}
```

### Step 3: 再抽共用元件（重構優化）
**目標**：提取可重用組件，優化代碼結構

**步驟**：
1. 識別重複使用的 UI 模式
2. 創建共用的 presentational 組件
3. 將業務邏輯與 UI 分離
4. 優化性能和可維護性

**範例**：
```tsx
// src/components/market/MarketCard.tsx (重構後)
export function MarketCard({ market, onFollow, onShare }: Props) {
  // 純 UI 組件，邏輯由父組件處理
}

// src/features/market/components/MarketCardContainer.tsx
export function MarketCardContainer({ marketId }: Props) {
  const market = useMarket(marketId);
  const { followMarket } = useMarketActions();
  
  return (
    <MarketCard 
      market={market}
      onFollow={() => followMarket(marketId)}
    />
  );
}
```

## 📁 建議的檔案結構

```
prediction-web/
├── src/
│   ├── app/                    # Next.js 路由（保留現有邏輯）
│   │   ├── (public)/
│   │   │   └── home/
│   │   │       └── page.tsx    # 只負責數據獲取和路由
│   │   └── (authenticated)/
│   │
│   ├── components/
│   │   ├── figma/              # Figma UI 組件（純展示）
│   │   │   ├── HomePageUI.tsx
│   │   │   ├── MarketDetailUI.tsx
│   │   │   └── ...
│   │   └── shared/             # 重構後的共用組件
│   │
│   └── features/               # 業務邏輯（保留現有）
│       ├── market/
│       │   ├── api/
│       │   ├── components/     # 連接數據的容器組件
│       │   └── types/
│       └── ...
```

## 🔄 整合順序建議

### 優先級 1（核心頁面）
1. ✅ **HomePage** - 首頁（用戶第一印象）
2. ✅ **MarketDetail** - 市場詳情（核心功能）

### 優先級 2（用戶功能）
3. ✅ **Profile** - 個人資料
4. ✅ **CreateQuestion** - 創建問題

### 優先級 3（輔助功能）
5. ✅ **Leaderboard** - 排行榜
6. ✅ **Quests** - 任務系統
7. ✅ **Notifications** - 通知
8. ✅ **Referrals** - 推薦

## ⚠️ 注意事項

### 技術差異
- **路由**：Figma 使用 React Router，主專案使用 Next.js App Router
- **數據獲取**：Figma 使用 mock，主專案使用 Server Components 和 API Routes
- **狀態管理**：需要整合現有的狀態管理邏輯

### 依賴檢查
Figma 專案使用的依賴需要確認是否與主專案兼容：
- ✅ `@radix-ui/*` - 應該兼容
- ✅ `tailwindcss` - 需要確認版本
- ⚠️ `react-router-dom` - 主專案使用 Next.js，不需要
- ⚠️ `@mui/material` - 主專案可能沒有，需要評估

### 樣式處理
- Figma 專案可能有自定義的 CSS，需要檢查 `src/styles/` 資料夾
- 確保 Tailwind 配置一致
- 字體和主題需要統一

## 🚀 開始整合

選擇一個頁面開始，按照三步驟進行：
1. 先套版（看到畫面）
2. 再接資料（連接 API）
3. 再抽共用元件（優化結構）
