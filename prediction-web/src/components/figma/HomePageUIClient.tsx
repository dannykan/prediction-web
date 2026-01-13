"use client";

import { useEffect, useState, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HomePageUI } from './HomePageUI';
import type { Market } from '@/features/market/types/market';
import type { Category } from '@/features/market/api/getCategories';
import { getMe } from '@/features/user/api/getMe';
import { getAllUserPositions } from '@/features/user/api/getAllUserPositions';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import { createNotification } from '@/features/notification/api/createNotification';
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
  const [isPending, startTransition] = useTransition();
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingRequestRef = useRef<Promise<void> | null>(null);

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
        
        // Create notification for welcome gift pack
        try {
          await createNotification({
            userId,
            type: 'gift',
            icon: '🎁',
            title: '新手禮包',
            message: '歡迎加入神預測！您已成功領取新手禮包，快去查看您的獎勵吧！',
            color: '#FF6B35',
            relatedId: null,
          });
          console.log('[HomePageUIClient] Welcome gift pack notification created');
        } catch (notifError) {
          console.error('[HomePageUIClient] Failed to create welcome gift notification:', notifError);
          // Don't fail the referral code application if notification creation fails
        }
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
    
    // 只在值真正改變時才更新狀態，避免無限循環
    setSearchQuery(prev => prev !== search ? search : prev);
    
    // Map category ID to name
    const newCategory = categoryId 
      ? (categories.find(cat => cat.id === categoryId)?.name || '全部')
      : '全部';
    setSelectedCategory(prev => prev !== newCategory ? newCategory : prev);
    
    // Map filter value to Chinese name for display
    const filterNameMap: Record<string, string> = {
      'all': '熱門',
      'latest': '最新',
      'closingSoon': '倒數中',
      'followed': '已關注',
      'myBets': '已下注',
    };
    
    const newFilter = filterNameMap[filter] || '熱門';
    setSelectedFilter(prev => prev !== newFilter ? newFilter : prev);
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
    // 延遲時間與 SearchBar 的防抖時間一致（500ms），適合中文輸入
    searchTimeoutRef.current = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      const trimmedValue = value.trim();
      
      // 只在值真正改變時才更新 URL，避免無限循環
      if (currentSearch !== trimmedValue) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (trimmedValue) {
            params.set('search', trimmedValue);
          } else {
            params.delete('search');
          }
          // 使用 replace 而不是 push，避免歷史記錄堆積
          router.replace(`/home?${params.toString()}`, { scroll: false });
        });
      }
    }, 500); // 500ms 防抖延遲，適合中文輸入法
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
    // 立即更新本地狀態，讓 UI 立即響應
    setSelectedCategory(category);
    
    // 取消正在進行的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 創建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    // 立即更新 URL（使用 window.history 直接更新，不等待 router）
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
    
    // 使用 window.history 直接更新 URL，立即生效
    const newUrl = `/home?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    
    // 然後在後台使用 router.replace 同步狀態（不阻塞 UI）
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  // 處理篩選變更（同步到 URL）
  const handleFilterChange = (filter: string) => {
    // 立即更新本地狀態，讓 UI 立即響應
    setSelectedFilter(filter);
    
    // 取消正在進行的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 創建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    // 立即更新 URL（使用 window.history 直接更新，不等待 router）
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
    
    // 使用 window.history 直接更新 URL，立即生效
    const newUrl = `/home?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    
    // 然後在後台使用 router.replace 同步狀態（不阻塞 UI）
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  // 標記初始加載完成
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // 當 URL 參數變化時，重新獲取 markets（跳過初始加載）
  useEffect(() => {
    // 跳過初始加載，因為已經有 initialMarkets
    if (isInitialLoad) return;
    
    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 創建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    async function fetchMarkets() {
      const search = searchParams.get('search') || '';
      const categoryId = searchParams.get('categoryId') || '';
      const filter = searchParams.get('filter') || 'all';
      
      // 先立即過濾現有數據（樂觀更新），讓 UI 立即響應
      // 然後在後台獲取完整數據
      if (markets.length > 0) {
        let optimisticMarkets = [...markets];
        
        // 應用分類過濾
        if (categoryId) {
          optimisticMarkets = optimisticMarkets.filter(market => 
            market.category?.id === categoryId
          );
        } else {
          // 如果沒有分類過濾，顯示所有市場
        }
        
        // 應用搜索過濾
        if (search) {
          const searchLower = search.toLowerCase();
          optimisticMarkets = optimisticMarkets.filter(market =>
            market.title.toLowerCase().includes(searchLower) ||
            market.description?.toLowerCase().includes(searchLower)
          );
        }
        
        // 應用排序
        if (filter === 'latest') {
          optimisticMarkets = optimisticMarkets.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        } else if (filter === 'closingSoon') {
          optimisticMarkets = optimisticMarkets
            .filter(market => market.closeTime && new Date(market.closeTime) > new Date())
            .sort((a, b) => {
              const dateA = a.closeTime ? new Date(a.closeTime).getTime() : Infinity;
              const dateB = b.closeTime ? new Date(b.closeTime).getTime() : Infinity;
              return dateA - dateB;
            });
        } else if (filter === 'all') {
          optimisticMarkets = optimisticMarkets.sort((a, b) => {
            const volumeA = a.totalVolume || 0;
            const volumeB = b.totalVolume || 0;
            return volumeB - volumeA;
          });
        }
        
        // 立即更新 UI（樂觀更新）
        setMarkets(optimisticMarkets);
      }
      
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
            signal: abortController.signal,
          });
          
          // 檢查請求是否被取消
          if (abortController.signal.aborted) {
            return;
          }
          
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
              signal: abortController.signal,
            }),
            fetch(`/api/markets?status=OPEN${search ? `&search=${encodeURIComponent(search)}` : ''}${categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ''}`, {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
              signal: abortController.signal,
            }),
          ]);
          
          // 檢查請求是否被取消
          if (abortController.signal.aborted) {
            return;
          }
          
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
            signal: abortController.signal,
          });
          
          // 檢查請求是否被取消
          if (abortController.signal.aborted) {
            return;
          }
          
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
        
        // 再次檢查請求是否被取消（在異步操作完成後）
        if (!abortController.signal.aborted) {
          setMarkets(fetchedMarkets);
        }
      } catch (error: any) {
        // 忽略 AbortError（請求被取消是正常的）
        if (error?.name === 'AbortError') {
          console.log('[HomePageUIClient] Request aborted (expected when switching filters quickly)');
          return;
        }
        console.error('[HomePageUIClient] Failed to fetch markets:', error);
        // Keep existing markets on error
      }
    }
    
    // 保存當前的請求 promise，以便在需要時取消
    const currentRequest = fetchMarkets();
    pendingRequestRef.current = currentRequest;
    
    // 清理函數：當 effect 重新運行時取消請求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
