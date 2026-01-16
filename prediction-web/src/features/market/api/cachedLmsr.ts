/**
 * 帶緩存的 LMSR API 調用
 * 避免重複請求相同的數據
 */

import { requestCache } from '@/utils/requestCache';
import {
  getOptionMarketsByMarketId,
  getExclusiveMarketByMarketId,
  type OptionMarketInfo,
  type ExclusiveMarketInfo,
} from './lmsr';
import { getAllTrades as getAllTradesOriginal, Trade } from './getAllTrades';

/**
 * 獲取 Option Markets（帶緩存）
 * 緩存時間：30 秒
 */
export async function getCachedOptionMarkets(
  marketId: string
): Promise<OptionMarketInfo[]> {
  return requestCache.get(
    `option-markets:${marketId}`,
    () => getOptionMarketsByMarketId(marketId),
    30000 // 30 秒緩存
  );
}

/**
 * 獲取所有交易記錄（帶緩存）
 * 緩存時間：15 秒（交易數據更新較快）
 */
export async function getCachedAllTrades(
  marketId: string,
  isSingle: boolean
): Promise<Trade[] | { trades: Trade[]; initialPrices?: any[] }> {
  return requestCache.get(
    `all-trades:${marketId}:${isSingle}`,
    () => getAllTradesOriginal(marketId, isSingle),
    15000 // 15 秒緩存
  );
}

/**
 * 獲取 Exclusive Market（帶緩存）
 * 緩存時間：30 秒
 */
export async function getCachedExclusiveMarket(
  marketId: string
): Promise<ExclusiveMarketInfo | null> {
  return requestCache.get(
    `exclusive-market:${marketId}`,
    () => getExclusiveMarketByMarketId(marketId),
    30000 // 30 秒緩存
  );
}

/**
 * 批量獲取多個市場的 Option Markets
 * 使用並行請求但仍享有緩存和去重的好處
 */
export async function batchGetOptionMarkets(
  marketIds: string[]
): Promise<Map<string, OptionMarketInfo[]>> {
  const results = await Promise.all(
    marketIds.map(async (id) => {
      try {
        const data = await getCachedOptionMarkets(id);
        return { id, data };
      } catch (error) {
        console.error(`[batchGetOptionMarkets] Failed for market ${id}:`, error);
        return { id, data: [] };
      }
    })
  );

  return new Map(results.map(r => [r.id, r.data]));
}

/**
 * 清除特定市場的緩存（當市場更新時調用）
 */
export function invalidateMarketCache(marketId: string) {
  requestCache.invalidate(`option-markets:${marketId}`);
  requestCache.invalidate(`all-trades:${marketId}:true`);
  requestCache.invalidate(`all-trades:${marketId}:false`);
  requestCache.invalidate(`exclusive-market:${marketId}`);
}

/**
 * 清除所有市場緩存
 */
export function clearAllMarketCache() {
  requestCache.clear();
}
