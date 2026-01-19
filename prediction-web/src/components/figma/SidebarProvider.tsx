"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { SidebarUI } from './SidebarUI';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import type { User } from '@/features/user/types/user';

interface SidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [unclaimedQuestsCount, setUnclaimedQuestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // 獨立載入用戶狀態（不依賴頁面）
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getMe().catch(() => null);
        if (userData) {
          setIsLoggedIn(true);
          setUser(userData);
          
          // 載入用戶統計資料
          if (userData.id) {
            try {
              const stats = await getUserStatistics(userData.id);
              setUserStatistics(stats);
            } catch (error) {
              console.error('[SidebarProvider] Failed to load user statistics:', error);
            }
          }

          // 載入任務和通知數量（可以在這裡添加 API 調用）
          // TODO: 添加 API 調用來獲取 unclaimedQuestsCount 和 unreadNotificationsCount
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      } catch (error) {
        // Only log unexpected errors (not 401 which is expected for unauthenticated users)
        if (process.env.NODE_ENV === 'development') {
          // Check if it's a network/fetch error (expected for 401)
          if (!(error instanceof TypeError && error.message.includes('fetch'))) {
            console.warn('[SidebarProvider] Failed to load user:', error);
          }
        }
        setIsLoggedIn(false);
        setUser(null);
        setUserStatistics(null);
      }
    };

    loadUser();

    // 定期刷新用戶狀態（每30秒）
    const interval = setInterval(loadUser, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup();
      // 重新載入用戶狀態
      const userData = await getMe().catch(() => null);
      if (userData) {
        setIsLoggedIn(true);
        setUser(userData);
        
        if (userData.id) {
          try {
            const stats = await getUserStatistics(userData.id);
            setUserStatistics(stats);
          } catch (error) {
            console.error('[SidebarProvider] Failed to load user statistics:', error);
          }
        }
      }
    } catch (error) {
      console.error('[SidebarProvider] Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // 清除登入狀態緩存
        const { clearCachedLoginStatus } = await import('@/core/auth/loginCache');
        clearCachedLoginStatus();
        
        setIsLoggedIn(false);
        setUser(null);
        setUserStatistics(null);
        // 重新載入頁面以清除所有狀態
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('[SidebarProvider] Logout error:', error);
    }
  };

  // 準備用戶資料給 SidebarUI
  const uiUser = user ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || undefined,
    totalAssets: userStatistics?.statistics?.profitRate?.total?.totalAssets ?? user.coinBalance ?? 0,
    inviteCode: user.referralCode ?? undefined,
  } : undefined;

  const contextValue: SidebarContextType = {
    isOpen,
    openSidebar: () => setIsOpen(true),
    closeSidebar: () => setIsOpen(false),
    toggleSidebar: () => setIsOpen(prev => !prev),
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Sidebar - 全局持久化，獨立運作 */}
      <SidebarUI
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isLoggedIn={isLoggedIn}
        user={uiUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        unclaimedQuestsCount={unclaimedQuestsCount}
        unreadNotificationsCount={unreadNotificationsCount}
      />
      
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* 頁面內容 */}
      {children}
    </SidebarContext.Provider>
  );
}