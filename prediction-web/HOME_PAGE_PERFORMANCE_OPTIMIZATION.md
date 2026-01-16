# 首页性能优化方案

## 当前性能问题分析

### 1. API 调用问题
**服务端（SSR）每次页面加载：**
- `getMeServer()` - 获取用户信息
- `getMarkets()` - 获取市场列表（可能多次调用）
- `getFollowedMarkets()` - 获取关注的市场
- `getAllUserPositionsServer()` - 获取用户持仓（用于 myBets 过滤）
- `getUserStatisticsServer()` - 获取用户统计
- `getQuestsServer()` - 获取任务
- `getCategories()` - 获取分类

**客户端（CSR）额外调用：**
- `getMe()` - 重复获取用户信息
- `getUserStatistics()` - 重复获取统计
- `getQuests()` - 重复获取任务
- `getUnreadCount()` - 获取未读通知数
- URL 参数变化时再次 `fetch('/api/markets')`

**问题：**
- 服务端和客户端重复获取相同数据
- 多个串行 API 调用，总耗时 = 所有 API 耗时之和
- "myBets" 过滤器中，先获取所有市场再过滤，效率低
- 没有充分利用缓存

### 2. 数据获取效率问题
- "myBets" 过滤器：先获取所有市场，再根据持仓过滤，浪费资源
- 没有使用聚合 API，无法一次性获取所有需要的数据
- 客户端在 URL 参数变化时重新获取所有市场数据

### 3. 渲染性能问题
- 可能没有使用代码分割，首屏加载所有 JS
- 图片可能没有优化
- 长列表没有虚拟滚动

## 优化方案

### 方案 1: 创建首页数据聚合 API（推荐，优先级最高）

**后端实现：**
```typescript
// GET /api/home-data
// 返回所有首页需要的数据
{
  user: User | null,
  userStatistics: UserStatistics | null,
  quests: Quest[] | null,
  unreadNotificationsCount: number,
  markets: Market[],
  categories: Category[],
  followedMarkets: Market[],
  marketsWithPositions: Market[] // 用于 myBets 过滤
}
```

**优势：**
- 将 7+ 个 API 调用减少到 1 个
- 后端可以并行查询数据库，比前端串行调用快得多
- 减少网络往返次数
- 可以统一缓存策略

**实现步骤：**
1. 后端创建 `HomeDataController` 和 `HomeDataService`
2. 前端创建 `getHomeData()` API 函数
3. 服务端和客户端都使用这个聚合 API
4. 根据 filter 参数决定返回哪些数据

### 方案 2: 优化数据获取逻辑

**问题修复：**
1. **"myBets" 过滤器优化**：
   - 后端新增 API: `GET /api/users/:userId/markets/with-positions`
   - 直接返回用户有持仓的市场，不需要先获取所有市场

2. **减少重复请求**：
   - 服务端获取的数据通过 props 传递给客户端
   - 客户端只在必要时（如刷新）才重新获取

3. **使用 Next.js 缓存**：
   ```typescript
   // 在 getMarkets 中已经使用了 revalidate: 60
   // 可以进一步优化缓存策略
   export const revalidate = 60; // 页面级别缓存
   ```

### 方案 3: 客户端优化

**1. 使用 SWR 或 React Query 进行数据缓存**
```typescript
import useSWR from 'swr';

// 自动缓存、重新验证、去重请求
const { data, error } = useSWR('/api/home-data', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // 2秒内相同请求去重
});
```

**2. 优化 URL 参数变化时的数据获取**
- 使用 `useTransition` 避免阻塞 UI（已实现）
- 使用 `AbortController` 取消进行中的请求（已实现）
- 添加请求去重，避免同时发起多个相同请求

**3. 代码分割和懒加载**
```typescript
// 懒加载非关键组件
const MarketCard = dynamic(() => import('./MarketCard'), {
  loading: () => <MarketCardSkeleton />,
  ssr: false, // 如果不需要 SSR
});
```

### 方案 4: 图片优化

**使用 Next.js Image 组件**
```typescript
import Image from 'next/image';

<Image
  src={market.imageUrl}
  alt={market.title}
  width={400}
  height={300}
  loading="lazy" // 懒加载
  placeholder="blur" // 模糊占位符
/>
```

### 方案 5: 虚拟滚动（如果市场列表很长）

如果首页显示的市场数量很多（>50），考虑使用虚拟滚动：
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// 只渲染可见区域的市场卡片
```

### 方案 6: 预加载和预取

**1. 使用 Next.js Link prefetch**
```typescript
<Link href="/m/[id]" prefetch={true}>
  {/* 预取市场详情页 */}
</Link>
```

**2. 预加载关键资源**
```typescript
// 在 _document.tsx 或 layout.tsx 中
<link rel="preload" href="/api/home-data" as="fetch" />
```

### 方案 7: 数据库查询优化

**后端优化：**
1. 为常用查询添加数据库索引
2. 使用 JOIN 查询减少数据库往返
3. 使用数据库连接池
4. 考虑使用 Redis 缓存热门数据

## 实施优先级

### 高优先级（立即实施）
1. ✅ **创建首页数据聚合 API** - 最大性能提升
2. ✅ **优化 "myBets" 过滤器** - 减少不必要的数据获取
3. ✅ **减少服务端和客户端重复请求** - 避免重复 API 调用

### 中优先级（近期实施）
4. ⚠️ **使用 SWR/React Query** - 改善客户端数据管理
5. ⚠️ **图片优化** - 使用 Next.js Image
6. ⚠️ **代码分割** - 减少首屏 JS 大小

### 低优先级（长期优化）
7. 📋 **虚拟滚动** - 如果列表很长
8. 📋 **数据库查询优化** - 后端性能优化
9. 📋 **预加载策略** - 进一步提升用户体验

## 预期性能提升

实施高优先级优化后：
- **API 调用次数**：从 7+ 次减少到 1-2 次
- **页面加载时间**：预计减少 50-70%
- **首屏渲染时间**：预计减少 40-60%
- **用户体验**：从"卡顿"到"流畅"

## 实施建议

1. **第一步**：创建首页数据聚合 API（后端 + 前端）
2. **第二步**：优化 "myBets" 过滤器逻辑
3. **第三步**：减少重复请求，统一数据获取方式
4. **第四步**：添加客户端数据缓存（SWR）
5. **第五步**：图片和代码优化
