/**
 * 簡單的請求緩存和去重機制
 * 避免相同的 API 請求在短時間內重複發送
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly DEFAULT_TTL = 30000; // 30 秒緩存

  /**
   * 獲取或執行請求
   * @param key - 緩存鍵
   * @param fetcher - 請求函數
   * @param ttl - 緩存時間（毫秒）
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const now = Date.now();

    // 檢查緩存是否有效
    const cached = this.cache.get(key);
    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    // 檢查是否有正在進行的相同請求（請求去重）
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // 執行新請求
    const promise = fetcher()
      .then((data) => {
        // 更新緩存
        this.cache.set(key, { data, timestamp: now });
        // 清除待處理請求
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        // 請求失敗，清除待處理請求
        this.pendingRequests.delete(key);
        // 如果有舊緩存，返回舊數據（stale-while-revalidate）
        if (cached) {
          console.warn(`[RequestCache] Request failed for ${key}, using stale cache`, error);
          return cached.data;
        }
        throw error;
      });

    // 記錄待處理請求
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * 清除特定緩存
   */
  invalidate(key: string) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * 清除所有緩存
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * 清除過期緩存
   */
  cleanup(ttl: number = this.DEFAULT_TTL) {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局單例
export const requestCache = new RequestCache();

// 定期清理過期緩存（每 5 分鐘）
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.cleanup();
  }, 5 * 60 * 1000);
}
