/**
 * Logger utility for development and production
 * 在生產環境中禁用調試 logs，只保留錯誤和警告
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Debug logs - 只在開發環境顯示
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Info logs - 只在開發環境顯示
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Warning logs - 在所有環境顯示（可能有助於排查問題）
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Error logs - 在所有環境顯示（重要錯誤需要記錄）
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log with prefix - 只在開發環境顯示
   */
  logWithPrefix: (prefix: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${prefix}]`, ...args);
    }
  },
};
