"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HomePageUI } from './HomePageUI';
import type { Market } from '@/features/market/types/market';
import type { Category } from '@/features/market/api/getCategories';
import { getMe } from '@/features/user/api/getMe';
import { getAllUserPositions } from '@/features/user/api/getAllUserPositions';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import { useReferralCodeFromUrl } from '@/features/referrals/hooks/useReferralCodeFromUrl';
import { applyReferralCode } from '@/features/referrals/api/applyReferralCode';
import type { User } from '@/features/user/types/user';
import { normalizeMarket } from '@/features/market/api/normalizeMarket';

interface HomePageUIClientProps {
  initialMarkets: Market[];
  initialCategories: Category[];
  commentsCountMap: Map<string, number>;
  initialSearch?: string;
  initialCategoryId?: string;
  initialCategoryName?: string;
  initialFilter?: string;
}

export function HomePageUIClient({
  initialMarkets,
  initialCategories,
  commentsCountMap,
  initialSearch = '',
  initialCategoryId,
  initialCategoryName,
  initialFilter = 'all',
}: HomePageUIClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [markets, setMarkets] = useState(initialMarkets);
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryName || '全部');
  
  // Map initial filter value (English) to Chinese name
  const filterNameMap: Record<string, string> = {
    'all': '熱門',
    'latest': '最新',
    'closingSoon': '倒數中',
    'followed': '已關注',
    'myBets': '已下注',
  };
  
  const [selectedFilter, setSelectedFilter] = useState(filterNameMap[initialFilter] || '熱門');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [quests, setQuests] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle referral code from URL
  const { getPendingReferralCode, clearPendingReferralCode } = useReferralCodeFromUrl();

  // Auto-apply referral code after login
  const applyPendingReferralCode = async (userId: string) => {
    const pendingCode = getPendingReferralCode();
    if (!pendingCode) return;

    try {
      // Generate a device ID
      const deviceId = localStorage.getItem('deviceId') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('deviceId')) {
        localStorage.setItem('deviceId', deviceId);
      }

      const result = await applyReferralCode(userId, pendingCode, deviceId);
      if (result.success) {
        console.log('[HomePageUIClient] Referral code applied successfully:', pendingCode);
        clearPendingReferralCode();
      } else {
        console.warn('[HomePageUIClient] Failed to apply referral code:', result.message);
        // Don't clear on error, user might want to try again
      }
    } catch (error) {
      console.error('[HomePageUIClient] Error applying referral code:', error);
      // Don't clear on error
    }
  };

  // 檢查用戶登入狀態並載入用戶資料
  useEffect(() => {
    getMe()
      .then(async (userData) => {
        if (userData) {
          setIsLoggedIn(true);
          setUser(userData);
          
          // Check if user hasn't used a referral code yet and there's a pending one
          if (userData.id && !userData.referredBy) {
            await applyPendingReferralCode(userData.id);
            // Refresh user data after applying referral code
            const updatedUser = await getMe();
            if (updatedUser) {
              setUser(updatedUser);
            }
          }
          
          // 載入用戶統計資料、任務和未讀通知計數
          if (userData.id) {
            try {
              const [stats, questsData, unreadCount] = await Promise.all([
                getUserStatistics(userData.id),
                getQuests(userData.id).catch((err) => {
                  console.error('[HomePageUIClient] Failed to load quests:', err);
                  return null;
                }),
                getUnreadCount(userData.id).catch((err) => {
                  console.error('[HomePageUIClient] Failed to load unread notifications count:', err);
                  return 0;
                }),
              ]);
              setUserStatistics(stats);
              setQuests(questsData);
              setUnreadNotificationsCount(unreadCount);
            } catch (error) {
              console.error('[HomePageUIClient] Failed to load user statistics:', error);
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

  // 同步 URL 參數到本地狀態
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const filter = searchParams.get('filter') || 'all';
    
    setSearchQuery(search);
    
    // Map category ID to name
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      setSelectedCategory(category ? category.name : '全部');
    } else {
      setSelectedCategory('全部');
    }
    
    // Map filter value to Chinese name for display
    const filterNameMap: Record<string, string> = {
      'all': '熱門',
      'latest': '最新',
      'closingSoon': '倒數中',
      'followed': '已關注',
      'myBets': '已下注',
    };
    
    setSelectedFilter(filterNameMap[filter] || '熱門');
  }, [searchParams, categories]);

  // 處理刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 重新載入頁面以獲取最新數據
      router.refresh();
      // 等待一小段時間讓數據更新
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  // 處理搜索變更（同步到 URL，使用防抖優化）
  const handleSearchChange = (value: string) => {
    // 立即更新本地狀態，讓 UI 響應更快
    setSearchQuery(value);
    
    // 清除之前的 timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 使用防抖來延遲 URL 更新，避免每次輸入都觸發 API 請求
    searchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      // 使用 replace 而不是 push，避免歷史記錄堆積
      router.replace(`/home?${params.toString()}`, { scroll: false });
    }, 300); // 300ms 防抖延遲
  };
  
  // 清理 timeout 當組件卸載時
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 處理分類變更（同步到 URL）
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === '全部') {
      params.delete('categoryId');
    } else {
      // 找到對應的分類 ID
      const categoryObj = categories.find(cat => cat.name === category);
      if (categoryObj) {
        params.set('categoryId', categoryObj.id);
      } else {
        // Fallback: 如果找不到，使用名稱（向後兼容）
        params.set('categoryId', category);
      }
    }
    router.push(`/home?${params.toString()}`);
  };

  // 處理篩選變更（同步到 URL）
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    
    // 映射 Figma 的篩選名稱到主項目的篩選值
    const filterMap: Record<string, string> = {
      '熱門': 'all',
      '最新': 'latest',
      '倒數中': 'closingSoon',
      '已關注': 'followed',
      '已下注': 'myBets',
    };
    
    const mappedFilter = filterMap[filter] || 'all';
    if (mappedFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', mappedFilter);
    }
    router.push(`/home?${params.toString()}`);
  };

  // 標記初始加載完成
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // 當 URL 參數變化時，重新獲取 markets（跳過初始加載）
  useEffect(() => {
    // 跳過初始加載，因為已經有 initialMarkets
    if (isInitialLoad) return;
    
    async function fetchMarkets() {
      const search = searchParams.get('search') || '';
      const categoryId = searchParams.get('categoryId') || '';
      const filter = searchParams.get('filter') || 'all';
      
      try {
        let fetchedMarkets: Market[] = [];
        
        if (filter === 'followed' && user?.id) {
          // Fetch followed markets (with search filter if provided)
          const queryParams = new URLSearchParams();
          if (search) queryParams.append('search', search);
          if (categoryId) queryParams.append('categoryId', categoryId);
          
          const response = await fetch(`/api/users/${encodeURIComponent(user.id)}/markets/followed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          
          if (response.ok) {
            const data = await response.json();
            fetchedMarkets = Array.isArray(data) ? data.map(normalizeMarket) : [];
            
            // Apply search filter client-side if backend doesn't support it
            if (search && fetchedMarkets.length > 0) {
              const searchLower = search.toLowerCase();
              fetchedMarkets = fetchedMarkets.filter(market => 
                market.title.toLowerCase().includes(searchLower) ||
                market.description?.toLowerCase().includes(searchLower)
              );
            }
          }
        } else if (filter === 'myBets' && user?.id) {
          // Fetch markets where user has positions
          const [positionsResponse, marketsResponse] = await Promise.all([
            fetch(`/api/users/${encodeURIComponent(user.id)}/positions`, {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            }),
            fetch(`/api/markets?status=OPEN${search ? `&search=${encodeURIComponent(search)}` : ''}${categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ''}`, {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            }),
          ]);
          
          if (positionsResponse.ok && marketsResponse.ok) {
            const positions = await positionsResponse.json();
            const allMarketsData = await marketsResponse.json();
            const allMarkets = Array.isArray(allMarketsData) ? allMarketsData.map(normalizeMarket) : [];
            const marketIds = Array.from(new Set(positions.map((p: any) => p.marketId)));
            
            fetchedMarkets = allMarkets.filter((m: Market) => marketIds.includes(m.id));
            
            // Sort by last trade time
            fetchedMarkets = fetchedMarkets.sort((a, b) => {
              const posA = positions.find((p: any) => p.marketId === a.id);
              const posB = positions.find((p: any) => p.marketId === b.id);
              if (!posA || !posB) return 0;
              const dateA = new Date(posA.lastTradeAt).getTime();
              const dateB = new Date(posB.lastTradeAt).getTime();
              return dateB - dateA;
            });
          }
        } else {
          // Fetch all markets with filters
          const queryParams = new URLSearchParams();
          queryParams.append('status', 'OPEN');
          if (search) queryParams.append('search', search);
          if (categoryId) queryParams.append('categoryId', categoryId);
          
          const response = await fetch(`/api/markets?${queryParams.toString()}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          
          if (response.ok) {
            const data = await response.json();
            fetchedMarkets = Array.isArray(data) ? data.map(normalizeMarket) : [];
            
            // Apply sorting based on filter
            if (filter === 'all') {
              // Sort by total volume (highest first) - 熱門
              fetchedMarkets = fetchedMarkets.sort((a, b) => {
                const volumeA = a.totalVolume || 0;
                const volumeB = b.totalVolume || 0;
                return volumeB - volumeA;
              });
            } else if (filter === 'latest') {
              // Sort by created date (newest first) - 最新
              fetchedMarkets = fetchedMarkets.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
            } else if (filter === 'closingSoon') {
              // Filter and sort by closing time (soonest first) - 倒數中
              fetchedMarkets = fetchedMarkets
                .filter(market => market.closeTime && new Date(market.closeTime) > new Date())
                .sort((a, b) => {
                  const dateA = a.closeTime ? new Date(a.closeTime).getTime() : Infinity;
                  const dateB = b.closeTime ? new Date(b.closeTime).getTime() : Infinity;
                  return dateA - dateB;
                });
            }
          }
        }
        
        setMarkets(fetchedMarkets);
      } catch (error) {
        console.error('[HomePageUIClient] Failed to fetch markets:', error);
        // Keep existing markets on error
      }
    }
    
    fetchMarkets();
  }, [searchParams, user?.id, isInitialLoad]);

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          const userData = await getMe();
          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
            
            if (userData.id) {
              try {
                // Check if user hasn't used a referral code yet
                if (!userData.referredBy) {
                  // Try to apply pending referral code
                  await applyPendingReferralCode(userData.id);
                  // Refresh user data after applying referral code
                  const updatedUser = await getMe();
                  if (updatedUser) {
                    setUser(updatedUser);
                  }
                }

                const [stats, questsData, unreadCount] = await Promise.all([
                  getUserStatistics(userData.id),
                  getQuests(userData.id).catch((err) => {
                    console.error('[HomePageUIClient] Failed to load quests after login:', err);
                    return null;
                  }),
                  getUnreadCount(userData.id).catch((err) => {
                    console.error('[HomePageUIClient] Failed to load unread notifications count after login:', err);
                    return 0;
                  }),
                ]);
                setUserStatistics(stats);
                setQuests(questsData);
                setUnreadNotificationsCount(unreadCount);
              } catch (error) {
                console.error('[HomePageUIClient] Failed to load user statistics:', error);
              }
            }
            
            router.refresh();
          } else {
            // 登入後獲取用戶數據失敗
            setIsLoggedIn(false);
            setUser(null);
            setUserStatistics(null);
          }
        },
        (error) => {
          console.error('[HomePageUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      );
    } catch (error) {
      console.error('[HomePageUIClient] Login error:', error);
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
        setQuests(null);
        setUnreadNotificationsCount(0);
        setIsLoggedIn(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[HomePageUIClient] Logout error:', error);
    }
  };

  // Calculate unclaimed quests count
  const calculateUnclaimedQuestsCount = (): number => {
    if (!quests) return 0;
    
    let count = 0;
    
    // Count unclaimed daily quest days (completed but not claimed)
    for (const quest of quests.dailyQuests) {
      if (quest.days) {
        count += quest.days.filter((day: any) => day.completed && !day.claimed).length;
      }
    }
    
    // Count unclaimed weekly quests (completed but not claimed)
    count += quests.weeklyQuests.filter((q: any) => q.isCompleted && !q.claimed).length;
    
    // Count completion bonus (can claim but not claimed)
    if (quests.canClaimCompletionBonus && !quests.completionBonusClaimed) {
      count += 1;
    }
    
    return count;
  };

  const unclaimedQuestsCount = quests ? calculateUnclaimedQuestsCount() : 0;

  // 準備用戶資料給 UI
  const uiUser = user && userStatistics ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: userStatistics.statistics?.profitRate?.total?.totalAssets || 0,
    inviteCode: user.referralCode && typeof user.referralCode === 'string' ? user.referralCode : undefined,
  } : undefined;

  return (
    <HomePageUI
      markets={markets}
      categories={categories}
      commentsCountMap={commentsCountMap}
      onRefresh={handleRefresh}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      selectedFilter={selectedFilter}
      onFilterChange={handleFilterChange}
      isLoggedIn={isLoggedIn}
      user={uiUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      unclaimedQuestsCount={unclaimedQuestsCount}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
}
