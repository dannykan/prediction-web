"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { QuestsUI } from './QuestsUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import { claimDailyQuestDay } from '@/features/quests/api/claimDailyQuestDay';
import { claimWeeklyQuest } from '@/features/quests/api/claimWeeklyQuest';
import { claimCompletionBonus } from '@/features/quests/api/claimCompletionBonus';
import { resetQuests } from '@/features/quests/api/resetQuests';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import type { QuestsResponse } from '@/features/quests/types/quest';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import { GCoinIcon } from '@/components/GCoinIcon';

export function QuestsUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quests, setQuests] = useState<QuestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showRewardBanner, setShowRewardBanner] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [claimingQuestIds, setClaimingQuestIds] = useState<Set<string>>(new Set());
  const [isResetting, setIsResetting] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getMe();
        if (!userData) {
          router.push("/");
          return;
        }
        setUser(userData);
        setIsLoggedIn(true);

        // Fetch quests, statistics, and unread notifications count in parallel
        const [questsData, stats, unreadCount] = await Promise.all([
          getQuests(userData.id),
          getUserStatistics(userData.id).catch((err) => {
            console.error('[QuestsUIClient] Failed to load user statistics:', err);
            return null;
          }),
          getUnreadCount(userData.id).catch((err) => {
            console.error('[QuestsUIClient] Failed to load unread notifications count:', err);
            return 0;
          }),
        ]);
        setQuests(questsData);
        setUserStatistics(stats);
        setUnreadNotificationsCount(unreadCount);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const refreshQuests = async () => {
    if (!user) return;
    try {
      const [questsData, unreadCount] = await Promise.all([
        getQuests(user.id),
        getUnreadCount(user.id).catch((err) => {
          console.error('[QuestsUIClient] Failed to refresh unread notifications count:', err);
          return 0;
        }),
      ]);
      setQuests(questsData);
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Failed to refresh quests:", error);
    }
  };

  const handleRefresh = async () => {
    await refreshQuests();
  };

  const triggerBanner = (amount: number) => {
    setLastReward(amount);
    setShowRewardBanner(true);
    setTimeout(() => {
      setShowRewardBanner(false);
    }, 3000);
  };

  const handleClaimDailyDay = async (questId: number, dayIndex: number) => {
    if (!user) return;
    const questKey = `daily_${questId}_${dayIndex}`;
    
    if (claimingQuestIds.has(questKey)) return;
    
    setClaimingQuestIds((prev) => new Set(prev).add(questKey));
    
    try {
      const response = await claimDailyQuestDay(user.id, questId, dayIndex);
      triggerBanner(response.rewardAmount);
      await refreshQuests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "領取失敗");
    } finally {
      setClaimingQuestIds((prev) => {
        const next = new Set(prev);
        next.delete(questKey);
        return next;
      });
    }
  };

  const handleClaimWeekly = async (questId: number) => {
    if (!user) return;
    const questKey = `weekly_${questId}`;
    
    if (claimingQuestIds.has(questKey)) return;
    
    setClaimingQuestIds((prev) => new Set(prev).add(questKey));
    
    try {
      const response = await claimWeeklyQuest(user.id, questId);
      triggerBanner(response.rewardAmount);
      await refreshQuests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "領取失敗");
    } finally {
      setClaimingQuestIds((prev) => {
        const next = new Set(prev);
        next.delete(questKey);
        return next;
      });
    }
  };

  const handleClaimCompletionBonus = async () => {
    if (!user) return;
    const questKey = "completion_bonus";
    
    if (claimingQuestIds.has(questKey)) return;
    
    setClaimingQuestIds((prev) => new Set(prev).add(questKey));
    
    try {
      const response = await claimCompletionBonus(user.id);
      triggerBanner(response.rewardAmount);
      await refreshQuests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "領取失敗");
    } finally {
      setClaimingQuestIds((prev) => {
        const next = new Set(prev);
        next.delete(questKey);
        return next;
      });
    }
  };

  const handleResetQuests = async () => {
    if (!user) return;
    if (!confirm("確定要重置所有任務進度嗎？這將清除所有已領取的記錄。")) {
      return;
    }

    setIsResetting(true);
    try {
      await resetQuests(user.id);
      alert("任務已重置");
      await refreshQuests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "重置失敗");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          const userData = await getMe();
          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
            // Fetch user statistics and unread notifications count after login
            try {
              const [stats, unreadCount] = await Promise.all([
                getUserStatistics(userData.id),
                getUnreadCount(userData.id).catch((err) => {
                  console.error('[QuestsUIClient] Failed to load unread notifications count after login:', err);
                  return 0;
                }),
              ]);
              setUserStatistics(stats);
              setUnreadNotificationsCount(unreadCount);
            } catch (err) {
              console.error('[QuestsUIClient] Failed to load user statistics after login:', err);
            }
            // Refresh quests after login
            await refreshQuests();
            router.refresh();
          } else {
            setIsLoggedIn(false);
            setUser(null);
            setUserStatistics(null);
            setUnreadNotificationsCount(0);
          }
        },
        (error) => {
          console.error('[QuestsUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
          setUnreadNotificationsCount(0);
        }
      );
    } catch (error) {
      console.error('[QuestsUIClient] Login error:', error);
      setIsLoggedIn(false);
      setUser(null);
      setUserStatistics(null);
      setUnreadNotificationsCount(0);
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
        setUnreadNotificationsCount(0);
        setIsLoggedIn(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[QuestsUIClient] Logout error:', error);
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

  if (isLoading || !quests) {
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

          <div className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0">
            <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <QuestsUI
            quests={quests}
            onClaimDailyDay={handleClaimDailyDay}
            onClaimWeekly={handleClaimWeekly}
            onClaimCompletionBonus={handleClaimCompletionBonus}
            onResetQuests={handleResetQuests}
            claimingQuestIds={claimingQuestIds}
            isResetting={isResetting}
          />
        </PullToRefresh>
      </div>

      {/* Reward Banner - Fixed Bottom */}
      {showRewardBanner && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-lg z-50"
          style={{
            animation: 'slideUpFromBottom 0.3s ease-out',
          }}
        >
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-bold">恭喜！領取獎勵成功</p>
              <div className="flex items-center gap-1 mt-1">
                <GCoinIcon size={16} />
                <span className="text-lg font-bold">+{lastReward.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
