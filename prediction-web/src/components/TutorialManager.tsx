'use client';

import { useEffect, useState } from 'react';
import { TutorialModal } from './TutorialModal';
import { getMe } from '@/features/user/api/getMe';
import type { User } from '@/features/user/types/user';

const TUTORIAL_STORAGE_KEY = 'hasSeenTutorial';
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
 * 用於快速判斷用戶是否可能已登入，避免在 API 響應前誤判
 */
function getCachedLoginStatus(): boolean | null {
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
 */
function setCachedLoginStatus(isLoggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache: UserLoginCache = {
      isLoggedIn,
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_LOGIN_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // 如果設置失敗，忽略錯誤（可能是存儲空間不足等）
    console.warn('[TutorialManager] Failed to cache login status:', error);
  }
}

/**
 * TutorialManager - 管理新手教學的顯示邏輯
 * 
 * 功能：
 * 1. 檢查用戶是否為訪客（未登入）
 * 2. 檢查是否已看過教學
 * 3. 如果是訪客且未看過教學，自動顯示教學
 * 4. 當用戶完成教學時，標記為已看過
 * 
 * 優化：
 * - 使用 localStorage 緩存登入狀態（5分鐘有效期），避免在 API 響應前誤判
 * - 如果緩存顯示已登入，等待 getMe() 完成確認後再決定是否顯示教學
 * - 如果緩存顯示未登入，直接判斷為訪客，立即顯示教學
 * - 避免已登入用戶在刷新頁面時被誤判為訪客而彈出教學
 */
export function TutorialManager() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndShowTutorial = async () => {
      try {
        // 先檢查緩存的登入狀態（快速判斷，避免誤判）
        const cachedLoginStatus = getCachedLoginStatus();
        
        let user: User | null = null;
        
        if (cachedLoginStatus === true) {
          // 緩存顯示用戶已登入，等待 API 響應確認
          // 增加重試邏輯，避免網絡延遲導致誤判
          let retryCount = 0;
          const maxRetries = 2;
          
          while (retryCount <= maxRetries && !user) {
            user = await getMe();
            if (!user && retryCount < maxRetries) {
              // 如果第一次失敗，等待一下再重試（可能是網絡延遲）
              await new Promise(resolve => setTimeout(resolve, 300));
              retryCount++;
            } else {
              break;
            }
          }
        } else if (cachedLoginStatus === false) {
          // 緩存顯示用戶未登入，直接判斷為訪客
          user = null;
        } else {
          // 沒有緩存，調用 API 獲取狀態
          user = await getMe();
        }

        // 更新緩存
        setCachedLoginStatus(user !== null);

        if (!user) {
          // 訪客狀態：無論是否看過教學，都顯示教學（因為訪客關閉後刷新應該還能再看）
          // 清除可能的舊標記，確保訪客每次都能看到
          localStorage.removeItem(TUTORIAL_STORAGE_KEY);
          // 稍微延遲一下，確保頁面已經渲染完成
          setTimeout(() => {
            setShowTutorial(true);
            setIsChecking(false);
          }, 500);
        } else {
          // 已登入用戶：檢查是否已看過教學
          const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
          if (hasSeenTutorial === 'true') {
            // 已登入且已看過教學，不顯示
            setIsChecking(false);
          } else {
            // 已登入但未看過教學，顯示教學（這應該很少見，因為通常訪客看完教學後會登入）
            setTimeout(() => {
              setShowTutorial(true);
              setIsChecking(false);
            }, 500);
          }
        }
      } catch (error) {
        // 如果檢查失敗（可能是網絡錯誤），使用緩存狀態來判斷
        const cachedLoginStatus = getCachedLoginStatus();
        if (cachedLoginStatus === true) {
          // 緩存顯示已登入，但 API 失敗，為了保險起見不顯示教學（可能是網絡問題）
          console.error('[TutorialManager] Error checking tutorial status (cached as logged in):', error);
          setIsChecking(false);
        } else {
          // 沒有緩存或緩存顯示未登入，可能是真正的訪客，顯示教學
          localStorage.removeItem(TUTORIAL_STORAGE_KEY);
          setTimeout(() => {
            setShowTutorial(true);
            setIsChecking(false);
          }, 500);
        }
      }
    };

    checkAndShowTutorial();
  }, []);

  const handleComplete = () => {
    // 標記為已看過教學
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  const handleClose = () => {
    // 關閉時不標記為已看過，這樣訪客刷新頁面後還會再次顯示
    setShowTutorial(false);
  };

  // 如果正在檢查，不渲染任何內容
  if (isChecking) {
    return null;
  }

  return (
    <TutorialModal
      isOpen={showTutorial}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
