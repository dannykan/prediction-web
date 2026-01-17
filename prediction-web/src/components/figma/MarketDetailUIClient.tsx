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
import { getMarketDetailData, type MarketDetailData } from '@/features/market/api/getMarketDetailData';

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
  const [marketDetailData, setMarketDetailData] = useState<MarketDetailData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 使用聚合 API 獲取所有市場數據
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setDataLoading(true);
        const data = await getMarketDetailData(market.id);
        setMarketDetailData(data);
        
        // 從聚合 API 獲取用戶信息（如果已登錄）
        if (data.user) {
          setIsLoggedIn(true);
          setUser({
            id: data.user.id,
            displayName: data.user.displayName,
            avatarUrl: data.user.avatarUrl,
          } as User);
          
          // 設置用戶統計資料
          if (data.user.statistics) {
            setUserStatistics({
              statistics: data.user.statistics,
            });
          }
          
          // 設置關注狀態
          setIsFollowing(data.user.followStatus || false);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
          setIsFollowing(false);
        }
      } catch (error) {
        console.error('[MarketDetailUIClient] Failed to load market detail data:', error);
        // 如果聚合 API 失敗，回退到舊的方式
        loadUserDataFallback();
      } finally {
        setDataLoading(false);
      }
    };

    loadMarketData();
  }, [market.id]);

  // 回退方案：如果聚合 API 失敗，使用舊的方式獲取用戶數據
  const loadUserDataFallback = async () => {
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
  };

  // 檢查關注狀態（如果聚合 API 沒有返回）
  useEffect(() => {
    async function fetchFollowStatus() {
      if (user?.id && !marketDetailData?.user?.followStatus) {
        try {
          const status = await checkFollowStatus(market.id, user.id);
          setIsFollowing(status.isFollowed);
        } catch (error) {
          console.error('[MarketDetailUIClient] Failed to check follow status:', error);
        }
      }
    }

    if (user?.id && !marketDetailData?.user?.followStatus) {
      fetchFollowStatus();
    }
  }, [market.id, user?.id, marketDetailData?.user?.followStatus]);

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

  // 刷新市場詳情數據（用於下注後刷新持倉等數據）
  const handleRefreshMarketData = async () => {
    try {
      setDataLoading(true);
      const data = await getMarketDetailData(market.id);
      setMarketDetailData(data);
      
      // 同時更新用戶信息和統計資料
      if (data.user) {
        setIsLoggedIn(true);
        setUser({
          id: data.user.id,
          displayName: data.user.displayName,
          avatarUrl: data.user.avatarUrl,
        } as User);
        
        if (data.user.statistics) {
          setUserStatistics({
            statistics: data.user.statistics,
          });
        }
        
        setIsFollowing(data.user.followStatus || false);
      }
    } catch (error) {
      console.error('[MarketDetailUIClient] Failed to refresh market detail data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // 準備用戶資料給 UI
  // 即使 userStatistics 還沒載入，也要顯示基本用戶資訊給 Sidebar
  const uiUser = user ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: userStatistics?.statistics?.profitRate?.total?.totalAssets ?? user.coinBalance ?? 0,
    inviteCode: user.referralCode ?? undefined,
  } : undefined;

  return (
    <MarketDetailUI
      market={market}
      commentsCount={commentsCount}
      onRefresh={handleRefresh}
      onRefreshMarketData={handleRefreshMarketData}
      isLoggedIn={isLoggedIn}
      user={uiUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onFollow={handleFollow}
      isFollowing={isFollowing}
      commentId={commentId}
      onCommentsCountChange={setCommentsCount}
      marketDetailData={marketDetailData}
      dataLoading={dataLoading}
    />
  );
}
