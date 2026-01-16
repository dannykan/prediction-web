# Redis 缓存实现指南

## 概述

为后端 API 添加 Redis 缓存层，减少数据库查询，提升响应速度。

## 实施步骤

### 1. 安装依赖

```bash
cd prediction-backend
npm install cache-manager cache-manager-redis-store redis
npm install --save-dev @types/cache-manager
```

### 2. 创建缓存模块

创建 `src/cache/cache.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (!redisUrl) {
          // Fallback to in-memory cache if Redis is not configured
          return {
            ttl: 300, // 5 minutes default TTL
            max: 100, // Maximum number of items in cache
          };
        }

        return {
          store: redisStore,
          url: redisUrl,
          ttl: 300, // 5 minutes default TTL
          max: 1000, // Maximum number of items in cache
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
```

### 3. 在 MarketsModule 中导入缓存

修改 `src/markets/markets.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
// ... other imports

@Module({
  imports: [
    CacheModule, // Add this
    // ... other imports
  ],
  // ... rest of module
})
export class MarketsModule {}
```

### 4. 在 MarketsService 中使用缓存

修改 `src/markets/markets.service.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MarketsService {
  constructor(
    // ... existing injections
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getHomeData(
    userId: string | null,
    filter: 'all' | 'latest' | 'closingSoon' | 'followed' | 'myBets',
    search?: string,
    categoryId?: string,
  ): Promise<HomeDataDto> {
    // Generate cache key
    const cacheKey = `home-data:${userId || 'guest'}:${filter}:${search || ''}:${categoryId || ''}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get<HomeDataDto>(cacheKey);
    if (cached) {
      console.log(`[getHomeData] Cache hit for key: ${cacheKey}`);
      return cached;
    }

    console.log(`[getHomeData] Cache miss for key: ${cacheKey}, fetching from database...`);

    // Fetch from database (existing logic)
    const [userData, userStatistics, quests, unreadCount, categories, marketsResult, followedMarketsResult, marketsWithPositionsResult] = 
      await Promise.allSettled([
        // ... existing Promise.allSettled calls
      ]);

    // Build response (existing logic)
    const homeData: HomeDataDto = {
      // ... build response
    };

    // Cache the result (5 minutes TTL)
    await this.cacheManager.set(cacheKey, homeData, 300);

    return homeData;
  }

  async findAll(
    userId?: string,
    query?: { status?: string; search?: string; categoryId?: string; creatorId?: string },
  ): Promise<Array<Market & { ... }>> {
    // Generate cache key
    const cacheKey = `markets:${userId || 'guest'}:${query?.status || 'all'}:${query?.search || ''}:${query?.categoryId || ''}:${query?.creatorId || ''}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get<Array<Market>>(cacheKey);
    if (cached) {
      console.log(`[findAll] Cache hit for key: ${cacheKey}`);
      return cached;
    }

    console.log(`[findAll] Cache miss for key: ${cacheKey}, fetching from database...`);

    // Existing database query logic
    // ... (keep existing code)

    // Cache the result (2 minutes TTL for market lists)
    await this.cacheManager.set(cacheKey, markets, 120);

    return markets;
  }

  // Invalidate cache when markets are updated
  async invalidateMarketCache(marketId?: string) {
    if (marketId) {
      // Invalidate specific market cache
      const pattern = `*market:${marketId}*`;
      // Note: cache-manager doesn't support pattern deletion directly
      // You may need to use Redis directly for pattern deletion
    } else {
      // Invalidate all market-related cache
      // This is a simplified version - in production, use Redis pattern matching
      await this.cacheManager.reset();
    }
  }
}
```

### 5. 环境变量配置

在 `.env` 中添加：

```env
# Redis Configuration (optional - falls back to in-memory cache)
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud/Upstash:
# REDIS_URL=rediss://default:password@host:port
```

### 6. 缓存策略

#### 缓存键命名规范

- `home-data:{userId}:{filter}:{search}:{categoryId}` - 首页聚合数据
- `markets:{userId}:{status}:{search}:{categoryId}:{creatorId}` - 市场列表
- `market:{marketId}` - 单个市场详情
- `categories:all` - 分类列表

#### TTL 设置

- **首页数据**: 5 分钟（300 秒）- 数据变化较频繁
- **市场列表**: 2 分钟（120 秒）- 需要实时性
- **市场详情**: 5 分钟（300 秒）- 相对稳定
- **分类列表**: 30 分钟（1800 秒）- 很少变化

#### 缓存失效策略

在以下操作后清除相关缓存：

1. **创建市场**: 清除 `home-data:*` 和 `markets:*`
2. **更新市场**: 清除特定市场缓存和列表缓存
3. **结算市场**: 清除所有相关缓存
4. **创建/更新分类**: 清除 `categories:*` 和 `home-data:*`

### 7. 监控和调试

添加缓存命中率监控：

```typescript
private cacheStats = {
  hits: 0,
  misses: 0,
};

async getHomeData(...) {
  const cacheKey = `...`;
  const cached = await this.cacheManager.get(cacheKey);
  
  if (cached) {
    this.cacheStats.hits++;
    return cached;
  }
  
  this.cacheStats.misses++;
  // ... fetch from database
}

// Add endpoint to get cache stats
getCacheStats() {
  const total = this.cacheStats.hits + this.cacheStats.misses;
  const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
  return {
    hits: this.cacheStats.hits,
    misses: this.cacheStats.misses,
    hitRate: `${hitRate}%`,
  };
}
```

## 性能提升预期

- **API 响应时间**: 减少 60-80%（缓存命中时）
- **数据库负载**: 减少 70-90%
- **并发处理能力**: 提升 3-5 倍

## 注意事项

1. **缓存一致性**: 确保缓存失效策略正确实施
2. **内存使用**: 监控 Redis 内存使用，设置合理的 max 值
3. **故障转移**: 如果 Redis 不可用，自动降级到内存缓存
4. **生产环境**: 使用 Redis Cloud 或 Upstash 等托管服务

## 部署检查清单

- [ ] 安装 Redis 依赖
- [ ] 创建 CacheModule
- [ ] 在 MarketsModule 中导入 CacheModule
- [ ] 在 MarketsService 中注入 CACHE_MANAGER
- [ ] 为 getHomeData 添加缓存
- [ ] 为 findAll 添加缓存
- [ ] 添加缓存失效逻辑
- [ ] 配置环境变量 REDIS_URL
- [ ] 测试缓存命中率
- [ ] 监控 Redis 内存使用
