"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardUI } from './LeaderboardUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import type { LeaderboardEntry, LeaderboardType } from '@/features/leaderboard/types/leaderboard';
import { getTimeLeft, getSeasonCode, DEFAULT_SEASONS } from '@/features/leaderboard/utils/season';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import { GCoinIcon } from '@/components/GCoinIcon';

type LeaderboardUIType = 'profit_rate' | 'profit_amount' | 'loss_amount';

// Map UI type to API type
const mapUITypeToAPIType = (uiType: LeaderboardUIType): LeaderboardType => {
  switch (uiType) {
    case 'profit_rate':
      return 'gods';
    case 'profit_amount':
      return 'whales';
    case 'loss_amount':
      return 'losers';
    default:
      return 'gods';
  }
};

interface LeaderboardUIClientProps {
  initialData: {
    leaderboard: LeaderboardEntry[];
    currentUserRank: LeaderboardEntry | null;
  };
  currentUserId?: string | null;
}

export function LeaderboardUIClient({ initialData, currentUserId }: LeaderboardUIClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboardUIType, setLeaderboardUIType] = useState<LeaderboardUIType>('profit_rate');
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASONS[0]!.name);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData.leaderboard);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(initialData.currentUserRank);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [quests, setQuests] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [timeUntilEnd, setTimeUntilEnd] = useState(getTimeLeft(selectedSeason));

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getMe();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
          // Fetch user statistics after getting user data
          try {
            const stats = await getUserStatistics(userData.id);
            setUserStatistics(stats);
          } catch (err) {
            console.error('[LeaderboardUIClient] Failed to load user statistics:', err);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setIsLoggedIn(false);
        setUser(null);
        setUserStatistics(null);
      }
    }
    fetchUser();
  }, []);

  // Update time until end every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilEnd(getTimeLeft(selectedSeason));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [selectedSeason]);

  // Initial time calculation
  useEffect(() => {
    setTimeUntilEnd(getTimeLeft(selectedSeason));
  }, [selectedSeason]);

  // Fetch leaderboard when type or season changes
  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const apiType = mapUITypeToAPIType(leaderboardUIType);
        const seasonCode = getSeasonCode(selectedSeason);
        const queryParams = new URLSearchParams();
        queryParams.append("type", apiType);
        queryParams.append("timeframe", "season");
        if (seasonCode) queryParams.append("season", seasonCode);
        queryParams.append("limit", "50");
        if (currentUserId) queryParams.append("userId", currentUserId);

        const response = await fetch(`/api/users/leaderboard?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setLeaderboard(data);
            setCurrentUserRank(null);
          } else {
            setLeaderboard(data.leaderboard || []);
            // Handle currentUserRank structure: it can be either { rank, entry: {...} } or direct entry object
            let userRank: any = data.currentUserRank || null;
            if (userRank && userRank.entry) {
              // If it's the nested structure, extract the entry
              userRank = { ...userRank.entry, rank: userRank.rank };
            }
            setCurrentUserRank(userRank);
          }
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [leaderboardUIType, selectedSeason, currentUserId]);

  const handleRefresh = async () => {
    try {
      const apiType = mapUITypeToAPIType(leaderboardUIType);
      const seasonCode = getSeasonCode(selectedSeason);
      const queryParams = new URLSearchParams();
      queryParams.append("type", apiType);
      queryParams.append("timeframe", "season");
      if (seasonCode) queryParams.append("season", seasonCode);
      queryParams.append("limit", "50");
      if (currentUserId) queryParams.append("userId", currentUserId);

      const response = await fetch(`/api/users/leaderboard?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
          setCurrentUserRank(null);
        } else {
          setLeaderboard(data.leaderboard || []);
          let userRank: any = data.currentUserRank || null;
          if (userRank && userRank.entry) {
            userRank = { ...userRank.entry, rank: userRank.rank };
          }
          setCurrentUserRank(userRank);
        }
      }
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          // 登入成功後立即刷新頁面（使用 window.location.reload() 確保完整刷新，特別是在內嵌瀏覽器中）
          // 這樣可以確保所有組件都重新載入，用戶可以立即使用所有功能
          window.location.reload();
        },
        (error) => {
          console.error('[LeaderboardUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      );
    } catch (error) {
      console.error('[LeaderboardUIClient] Login error:', error);
      setIsLoggedIn(false);
      setUser(null);
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
      console.error('[LeaderboardUIClient] Logout error:', error);
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

  // Prepare user data for Sidebar and MobileHeader
  const uiUser = user && userStatistics ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: userStatistics.statistics?.profitRate?.total?.totalAssets || 0,
    inviteCode: user.referralCode || undefined,
  } : user ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: 0,
    inviteCode: user.referralCode || undefined,
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MobileHeaderUI 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={uiUser}
      />

      <div className="flex w-full">
          <SidebarUI 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isLoggedIn={isLoggedIn}
            user={uiUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            unclaimedQuestsCount={unclaimedQuestsCount}
            unreadNotificationsCount={unreadNotificationsCount}
          />

        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <LeaderboardUI
            leaderboardType={leaderboardUIType}
            onTypeChange={setLeaderboardUIType}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            leaderboard={leaderboard}
            currentUserRank={currentUserRank}
            currentUserId={currentUserId || user?.id || null}
            timeUntilEnd={timeUntilEnd}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </PullToRefresh>
      </div>

      {/* My Ranking - Fixed Bottom (outside PullToRefresh to ensure fixed positioning works) */}
      {currentUserRank && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 shadow-lg z-30">
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-2.5">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-slate-600 font-bold text-sm md:text-base">
                  #{currentUserRank.rank || 0}
                </div>
              </div>
              {currentUserRank.avatarUrl && currentUserRank.avatarUrl.trim() !== '' ? (
                <img
                  src={currentUserRank.avatarUrl}
                  alt={currentUserRank.displayName || 'User'}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm md:text-base font-bold flex-shrink-0">
                  {(currentUserRank.displayName || 'U')[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">我的排名</h3>
              </div>
              <div className="flex-shrink-0">
                <div className="font-bold text-sm md:text-base">
                  {(() => {
                    // getScoreDisplay helper function
                    if (leaderboardUIType === 'profit_rate') {
                      const profitRate = currentUserRank.profitRate ?? 0;
                      const isPositive = profitRate >= 0;
                      return (
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {isPositive ? '+' : ''}{profitRate.toFixed(1)}%
                        </span>
                      );
                    } else if (leaderboardUIType === 'profit_amount') {
                      // 鯨魚榜：顯示賽季已實現盈虧（G coin數量，可以是正也可以是負）
                      const pnl = currentUserRank.pnl ?? 0;
                      const isPositive = pnl >= 0;
                      return (
                        <div className="flex items-center gap-1">
                          <GCoinIcon size={16} />
                          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {isPositive ? '+' : ''}{pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    } else {
                      // 衰人榜：顯示賽季已實現盈虧（G coin數量，可以是正也可以是負）
                      const pnl = currentUserRank.pnl ?? 0;
                      const isPositive = pnl >= 0;
                      return (
                        <div className="flex items-center gap-1">
                          <GCoinIcon size={16} />
                          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {isPositive ? '+' : ''}{pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
