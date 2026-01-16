import { useEffect, useState } from 'react';

/**
 * Debounce hook - 延遲更新值直到用戶停止輸入
 * @param value - 要防抖的值
 * @param delay - 延遲時間（毫秒）
 * @returns 防抖後的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 設置定時器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函數：在值改變或組件卸載時清除定時器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
