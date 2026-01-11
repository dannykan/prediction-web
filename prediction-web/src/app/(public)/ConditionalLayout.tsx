"use client";

import { usePathname } from "next/navigation";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  oldLayout: React.ReactNode;
}

/**
 * ⚠️ 重要：使用 Figma UI 的頁面列表
 * 
 * 這些頁面不需要舊的 Navbar 和 BottomNavigation，因為它們使用自己的布局
 * 
 * 🔄 整合新頁面時必須更新：
 * 1. 如果是靜態路徑：添加到 FIGMA_UI_PAGES 數組
 * 2. 如果是動態路由：添加到 FIGMA_UI_PATTERNS 數組
 * 3. 更新 FIGMA_UI_PAGES.md 文檔
 * 
 * 已整合的頁面：
 * - /home, / (HomePage)
 * - /m/[id] (MarketDetail)
 */
const FIGMA_UI_PAGES = [
  "/home",
  "/", // 根路徑重定向到 /home
  "/leaderboard",
];

/**
 * ⚠️ 重要：使用 Figma UI 的路徑模式（支持動態路由）
 * 
 * 使用正則表達式匹配動態路由
 * 例如：/m/[id] 使用 /^\/m\/[^/]+$/
 * 
 * 🔄 整合新頁面時，如果是動態路由，必須添加對應的正則表達式
 */
const FIGMA_UI_PATTERNS = [
  /^\/m\/[^/]+$/, // /m/[id] - MarketDetail
];

/**
 * 檢查路徑是否使用 Figma UI
 */
function usesFigmaUI(pathname: string): boolean {
  // 檢查精確匹配
  if (FIGMA_UI_PAGES.includes(pathname)) {
    return true;
  }
  
  // 檢查路徑模式
  return FIGMA_UI_PATTERNS.some(pattern => pattern.test(pathname));
}

export function ConditionalLayout({ children, oldLayout }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // 如果使用 Figma UI，直接返回 children（不包含舊的 Navbar 和 BottomNavigation）
  if (usesFigmaUI(pathname)) {
    return <>{children}</>;
  }
  
  // 其他頁面使用舊的布局（包含 Navbar 和 BottomNavigation）
  return <>{oldLayout}</>;
}
