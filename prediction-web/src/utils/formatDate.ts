/**
 * 時間格式化工具函數
 * 統一處理後端返回的 UTC 時間，轉換為台北時間 (UTC+8) 顯示
 * 
 * 問題說明：
 * - 後端返回的時間是 UTC 格式（例如：2025-01-17T10:00:00.000Z）
 * - 但實際上這個時間應該是台北時間 (UTC+8)
 * - 例如：後端返回 "2025-01-17T10:00:00.000Z"，實際上是台北時間 "2025-01-17 18:00:00"
 * - 解決方法：解析 UTC 時間後，加上 8 小時來得到正確的台北時間
 */

/**
 * 將 UTC 時間字符串或 Date 對象轉換為台北時間 (UTC+8)
 * 由於後端返回的 UTC 時間實際上是台北時間（但標記為 UTC），
 * 我們需要加上 8 小時來得到正確的時間
 * 
 * @param dateValue - UTC 時間字符串或 Date 對象
 * @returns 台北時間的 Date 對象
 */
export function parseToTaipeiTime(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue) return null;

  let date: Date;
  
  if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    const str = String(dateValue).trim();
    // 如果沒有時區標記，假設是 UTC
    const normalizedStr = str.endsWith('Z') || str.match(/[+-]\d{2}:?\d{2}$/) 
      ? str 
      : `${str}Z`;
    date = new Date(normalizedStr);
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  // 重要：後端返回的 UTC 時間實際上是台北時間（但被標記為 UTC）
  // 我們需要加上 8 小時來得到正確的台北時間
  // 例如：後端返回 "2025-01-17T10:00:00.000Z"（實際上是台北時間 18:00:00）
  // 我們將其轉換為 "2025-01-17T18:00:00.000Z"，然後 formatDistanceToNow 會正確顯示
  const taipeiOffsetMs = 8 * 60 * 60 * 1000; // 8 小時的毫秒數
  const taipeiTime = new Date(date.getTime() + taipeiOffsetMs);
  
  return taipeiTime;
}

/**
 * 格式化時間為台北時間顯示
 * @param dateValue - UTC 時間字符串或 Date 對象
 * @param options - 格式化選項
 * @returns 格式化後的時間字符串
 */
export function formatTaipeiTime(
  dateValue: string | Date | null | undefined,
  options?: {
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
  }
): string {
  const taipeiDate = parseToTaipeiTime(dateValue);
  if (!taipeiDate) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return taipeiDate.toLocaleString('zh-TW', defaultOptions);
}

/**
 * 格式化時間為相對時間（台北時間）
 * 用於顯示「多久以前」或「多久之後」
 * @param dateValue - UTC 時間字符串或 Date 對象
 * @returns 格式化後的相對時間字符串（已轉換為台北時間）
 */
export function formatTaipeiDistanceToNow(dateValue: string | Date | null | undefined): string {
  const taipeiDate = parseToTaipeiTime(dateValue);
  if (!taipeiDate) return '';

  // 計算當前時間的台北時間
  const now = new Date();
  const taipeiNowOffset = 8 * 60;
  const utcNowTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const taipeiNow = new Date(utcNowTime + (taipeiNowOffset * 60000));

  // 計算時間差
  const diffMs = taipeiNow.getTime() - taipeiDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '剛剛';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    // 超過一週，顯示日期
    return formatTaipeiTime(dateValue, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
