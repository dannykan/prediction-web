/**
 * 登入狀態緩存工具
 * 用於快速判斷用戶是否已登入，避免在 API 響應前誤判
 */

const USER_LOGIN_CACHE_KEY = 'userLoginCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存有效期

/**
 * 用戶登入狀態緩存接口
 */
interface UserLoginCache {
  isLoggedIn: boolean;
  timestamp: number;
}

/**
 * 獲取緩存的用戶登入狀態
 * @returns true 表示已登入，false 表示未登入，null 表示沒有緩存或已過期
 */
export function getCachedLoginStatus(): boolean | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(USER_LOGIN_CACHE_KEY);
    if (!cached) return null;
    
    const cache: UserLoginCache = JSON.parse(cached);
    const now = Date.now();
    
    // 檢查緩存是否過期（5 分鐘）
    if (now - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(USER_LOGIN_CACHE_KEY);
      return null;
    }
    
    return cache.isLoggedIn;
  } catch (error) {
    // 如果解析失敗，清除緩存
    localStorage.removeItem(USER_LOGIN_CACHE_KEY);
    return null;
  }
}

/**
 * 設置用戶登入狀態緩存
 * @param isLoggedIn 是否已登入
 */
export function setCachedLoginStatus(isLoggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache: UserLoginCache = {
      isLoggedIn,
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_LOGIN_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // 如果設置失敗，忽略錯誤（可能是存儲空間不足等）
    console.warn('[loginCache] Failed to cache login status:', error);
  }
}

/**
 * 清除用戶登入狀態緩存
 * 通常在登出時調用
 */
export function clearCachedLoginStatus(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_LOGIN_CACHE_KEY);
  } catch (error) {
    // 忽略錯誤
    console.warn('[loginCache] Failed to clear login status cache:', error);
  }
}
