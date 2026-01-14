"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketDetailUI } from './MarketDetailUI';
import type { Market } from '@/features/market/types/market';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import type { User } from '@/features/user/types/user';
import { checkFollowStatus, followMarket, unfollowMarket } from '@/features/market/api/followMarket';

interface MarketDetailUIClientProps {
  market: Market;
  commentId?: string;
  onRefresh?: () => Promise<void>;
  initialCommentsCount?: number;
}

export function MarketDetailUIClient({
  market,
  commentId,
  onRefresh,
  initialCommentsCount = 0,
}: MarketDetailUIClientProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [isFollowing, setIsFollowing] = useState(false);

  // 檢查用戶登入狀態並載入用戶資料
  useEffect(() => {
    getMe()
      .then(async (userData) => {
        if (userData) {
          setIsLoggedIn(true);
          setUser(userData);
          
          // 載入用戶統計資料
          if (userData.id) {
            try {
              const stats = await getUserStatistics(userData.id);
              setUserStatistics(stats);
            } catch (error) {
              console.error('[MarketDetailUIClient] Failed to load user statistics:', error);
            }
          }
        } else {
          // 用戶未登入
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
        setUserStatistics(null);
      });
  }, []);

  // 檢查關注狀態
  useEffect(() => {
    async function fetchFollowStatus() {
      if (user?.id) {
        try {
          const status = await checkFollowStatus(market.id, user.id);
          setIsFollowing(status.isFollowed);
        } catch (error) {
          console.error('[MarketDetailUIClient] Failed to check follow status:', error);
          // 如果檢查失敗，保持默認狀態（false）
        }
      }
    }

    if (user?.id) {
      fetchFollowStatus();
    }
  }, [market.id, user?.id]);

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          // 登入成功後立即刷新頁面（使用 window.location.reload() 確保完整刷新，特別是在內嵌瀏覽器中）
          // 這樣可以確保所有組件都重新載入，用戶可以立即使用所有功能（下注、評論等）
          window.location.reload();
        },
        (error) => {
          console.error('[MarketDetailUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      );
    } catch (error) {
      console.error('[MarketDetailUIClient] Login error:', error);
      setIsLoggedIn(false);
      setUser(null);
      setUserStatistics(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        setUserStatistics(null);
        setIsLoggedIn(false);
        setIsFollowing(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[MarketDetailUIClient] Logout error:', error);
    }
  };

  const handleFollow = async () => {
    if (!user?.id) {
      // 如果未登入，觸發登入流程
      await handleLogin();
      return;
    }

    try {
      const previousState = isFollowing;
      // 樂觀更新 UI
      setIsFollowing(!previousState);

      // 調用 API
      if (previousState) {
        await unfollowMarket(market.id, user.id);
      } else {
        await followMarket(market.id, user.id);
      }

      console.log('[MarketDetailUIClient] Follow/unfollow market:', market.id, !previousState);
    } catch (error) {
      console.error('[MarketDetailUIClient] Failed to follow/unfollow market:', error);
      // 如果失敗，恢復之前的狀態
      setIsFollowing(!isFollowing);
      alert('操作失敗，請重試');
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // 重新載入頁面數據
      router.refresh();
    }
  };

  // 準備用戶資料給 UI
  const uiUser = user && userStatistics ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: userStatistics.statistics.profitRate.total.totalAssets,
    inviteCode: user.referralCode ?? undefined,
  } : undefined;

  return (
    <MarketDetailUI
      market={market}
      commentsCount={commentsCount}
      onRefresh={handleRefresh}
      isLoggedIn={isLoggedIn}
      user={uiUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onFollow={handleFollow}
      isFollowing={isFollowing}
      commentId={commentId}
    />
  );
}
