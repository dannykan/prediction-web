'use client';

import { useEffect, useState } from 'react';
import { TutorialModal } from './TutorialModal';
import { getMe } from '@/features/user/api/getMe';
import type { User } from '@/features/user/types/user';

const TUTORIAL_STORAGE_KEY = 'hasSeenTutorial';

/**
 * TutorialManager - 管理新手教學的顯示邏輯
 * 
 * 功能：
 * 1. 檢查用戶是否為訪客（未登入）
 * 2. 檢查是否已看過教學
 * 3. 如果是訪客且未看過教學，自動顯示教學
 * 4. 當用戶完成教學時，標記為已看過
 */
export function TutorialManager() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndShowTutorial = async () => {
      try {
        // 先檢查用戶是否已登入
        const user: User | null = await getMe();

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
        // 如果檢查失敗（可能是網絡錯誤），為了保險起見不顯示教學
        console.error('[TutorialManager] Error checking tutorial status:', error);
        setIsChecking(false);
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
