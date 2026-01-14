"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationsUI } from './NotificationsUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getNotifications } from '@/features/notification/api/getNotifications';
import { markNotificationAsRead } from '@/features/notification/api/markNotificationAsRead';
import { markAllNotificationsAsRead } from '@/features/notification/api/markAllNotificationsAsRead';
import { getQuests } from '@/features/quest/api/getQuests';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import type { Notification } from '@/features/notification/api/getNotifications';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';

export function NotificationsUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const [quests, setQuests] = useState<any>(null);

  // Fetch user data and notifications on mount
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

        // Fetch notifications, statistics, and quests in parallel
        const [notifs, stats, questsData] = await Promise.all([
          getNotifications(userData.id, 1, 50).catch((err) => {
            console.error('[NotificationsUIClient] Failed to load notifications:', err);
            return [];
          }),
          getUserStatistics(userData.id).catch((err) => {
            console.error('[NotificationsUIClient] Failed to load user statistics:', err);
            return null;
          }),
          getQuests(userData.id).catch((err) => {
            console.error('[NotificationsUIClient] Failed to load quests:', err);
            return null;
          }),
        ]);
        setNotifications(notifs);
        setUserStatistics(stats);
        setQuests(questsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const [notifs, questsData] = await Promise.all([
        getNotifications(user.id, 1, 50),
        getQuests(user.id).catch((err) => {
          console.error('[NotificationsUIClient] Failed to refresh quests:', err);
          return null;
        }),
      ]);
      setNotifications(notifs);
      setQuests(questsData);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    }
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user) return;

    setMarkingAsRead(notificationId);
    try {
      await markNotificationAsRead(notificationId, user.id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isNew: false } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isNew: false }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.relatedId) {
      if (notification.type === 'comment_reply' || notification.type === 'comment_like') {
        router.push(`/m/${notification.relatedId}`);
      } else if (notification.type === 'market_settlement') {
        router.push(`/m/${notification.relatedId}`);
      }
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
          console.error('[NotificationsUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      );
    } catch (error) {
      console.error('[NotificationsUIClient] Login error:', error);
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
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[NotificationsUIClient] Logout error:', error);
    }
  };

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

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => n.isNew).length;

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

  if (isLoading) {
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
            unreadNotificationsCount={unreadCount}
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
          unreadNotificationsCount={unreadCount}
        />

        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <NotificationsUI
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNotificationClick={handleNotificationClick}
            markingAsRead={markingAsRead}
          />
        </PullToRefresh>
      </div>
    </div>
  );
}
