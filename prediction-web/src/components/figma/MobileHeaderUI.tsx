"use client";

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/utils/formatNumber';
import { GCoinIcon } from '@/components/GCoinIcon';
import { useContext } from 'react';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { useState, useEffect } from 'react';
import type { User } from '@/features/user/types/user';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import { SidebarContext } from './SidebarProvider';

interface MobileHeaderUIProps {
  onMenuClick?: () => void; // Optional, will use global sidebar if not provided
  isLoggedIn?: boolean; // Optional, will load independently if not provided
  user?: {
    totalAssets: number;
    avatar: string;
  };
  onLogin?: () => void; // Optional, will use global handler if not provided
}

export function MobileHeaderUI({ 
  onMenuClick,
  isLoggedIn: propIsLoggedIn,
  user: propUser,
  onLogin: propOnLogin,
}: MobileHeaderUIProps) {
  // 尝试使用全局 Sidebar context（可选，如果不在 Provider 中则为 undefined）
  const sidebarContext = useContext(SidebarContext);
  
  // 如果沒有提供 props，則獨立載入用戶狀態
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn ?? false);
  const [user, setUser] = useState<{ totalAssets: number; avatar: string } | undefined>(propUser);
  
  useEffect(() => {
    // 如果 props 有提供，使用 props
    if (propIsLoggedIn !== undefined) {
      setIsLoggedIn(propIsLoggedIn);
      setUser(propUser);
      return;
    }

    // 否則獨立載入
    const loadUser = async () => {
      try {
        const userData = await getMe().catch(() => null);
        if (userData) {
          setIsLoggedIn(true);
          try {
            const stats = await getUserStatistics(userData.id);
            setUser({
              totalAssets: stats?.statistics?.profitRate?.total?.totalAssets ?? userData.coinBalance ?? 0,
              avatar: userData.avatarUrl || '',
            });
          } catch {
            setUser({
              totalAssets: userData.coinBalance ?? 0,
              avatar: userData.avatarUrl || '',
            });
          }
        } else {
          setIsLoggedIn(false);
          setUser(undefined);
        }
      } catch (error) {
        // Only log unexpected errors (not 401 which is expected for unauthenticated users)
        if (process.env.NODE_ENV === 'development') {
          // Check if it's a network/fetch error (expected for 401)
          if (!(error instanceof TypeError && error.message.includes('fetch'))) {
            console.warn('[MobileHeaderUI] Failed to load user:', error);
          }
        }
        setIsLoggedIn(false);
        setUser(undefined);
      }
    };

    loadUser();
  }, [propIsLoggedIn, propUser]);

  const handleMenuClick = onMenuClick || (() => {
    // 如果有 Sidebar context，使用它
    if (sidebarContext && sidebarContext.toggleSidebar) {
      sidebarContext.toggleSidebar();
    }
    // 如果没有 context，菜单按钮不会工作，但不会报错
  });
  const handleLogin = propOnLogin || (async () => {
    try {
      await signInWithGooglePopup();
      // 重新載入用戶狀態
      const userData = await getMe().catch(() => null);
      if (userData) {
        setIsLoggedIn(true);
          try {
            const stats = await getUserStatistics(userData.id);
            setUser({
              totalAssets: stats?.statistics?.profitRate?.total?.totalAssets ?? userData.coinBalance ?? 0,
              avatar: userData.avatarUrl || '',
            });
        } catch {
          setUser({
            totalAssets: userData.coinBalance ?? 0,
            avatar: userData.avatarUrl || '',
          });
        }
      }
    } catch (error) {
      console.error('[MobileHeaderUI] Login error:', error);
    }
  });

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <button 
          onClick={handleMenuClick}
          className="relative p-2 text-slate-600 hover:text-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href="/home" className="flex items-center gap-2">
          <Image 
            src="/images/logo.png" 
            alt="神預測 Logo" 
            width={32} 
            height={32}
            className="w-8 h-8 object-contain rounded-lg"
            priority
          />
          <div>
            <h1 className="font-bold text-base text-slate-800 leading-tight">神預測</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Prediction God</p>
          </div>
        </Link>

        {isLoggedIn && user ? (
          <div className="flex items-center gap-2">
            <GCoinIcon size={20} priority={true} />
            <span className="font-bold text-amber-600 text-sm">{formatNumber(user.totalAssets)}</span>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
          >
            登入
          </button>
        )}
      </div>
    </header>
  );
}
