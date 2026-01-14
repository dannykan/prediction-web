"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileUI } from './ProfileUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getUserTransactions, type Transaction } from '@/features/user/api/getUserTransactions';
import { getAllUserPositions, type UserPosition } from '@/features/user/api/getAllUserPositions';
import { getUserComments, type UserComment } from '@/features/user/api/getUserComments';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';

type TabType = 'overview' | 'transactions' | 'positions' | 'comments';

export function ProfileUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quests, setQuests] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

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
        setEditName(userData.displayName || userData.username || '');
        setEditAvatarUrl(userData.avatarUrl ?? null);

        // Fetch all data in parallel with error handling for each
        const [stats, txs, pos, commentsData, questsData, unreadCount] = await Promise.allSettled([
          getUserStatistics(userData.id).catch((err) => {
            console.error('[ProfileUIClient] Failed to load user statistics:', err);
            return null;
          }),
          getUserTransactions(userData.id).catch((err) => {
            console.error('[ProfileUIClient] Failed to load user transactions:', err);
            return [];
          }),
          getAllUserPositions(userData.id).catch((err) => {
            console.error('[ProfileUIClient] Failed to load user positions:', err);
            return [];
          }),
          getUserComments(userData.id, { page: 1, limit: 20, currentUserId: userData.id }).catch((err) => {
            console.error('[ProfileUIClient] Failed to load user comments:', err);
            return { comments: [], total: 0, page: 1, limit: 20, hasMore: false };
          }),
          getQuests(userData.id).catch((err) => {
            console.error('[ProfileUIClient] Failed to load quests:', err);
            return null;
          }),
          getUnreadCount(userData.id).catch((err) => {
            console.error('[ProfileUIClient] Failed to load unread notifications count:', err);
            return 0;
          }),
        ]);

        // Extract values from Promise.allSettled results
        setStatistics(stats.status === 'fulfilled' ? stats.value : null);
        setTransactions(txs.status === 'fulfilled' ? txs.value : []);
        setPositions(pos.status === 'fulfilled' ? pos.value : []);
        setComments(commentsData.status === 'fulfilled' ? commentsData.value.comments : []);
        setQuests(questsData.status === 'fulfilled' ? questsData.value : null);
        setUnreadNotificationsCount(unreadCount.status === 'fulfilled' ? unreadCount.value : 0);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleRefresh = async () => {
    if (!user) return;
    
    try {
      const [stats, txs, pos, commentsData] = await Promise.allSettled([
        getUserStatistics(user.id).catch((err) => {
          console.error('[ProfileUIClient] Failed to refresh user statistics:', err);
          return null;
        }),
        getUserTransactions(user.id).catch((err) => {
          console.error('[ProfileUIClient] Failed to refresh user transactions:', err);
          return [];
        }),
        getAllUserPositions(user.id).catch((err) => {
          console.error('[ProfileUIClient] Failed to refresh user positions:', err);
          return [];
        }),
        getUserComments(user.id, { page: 1, limit: 20, currentUserId: user.id }).catch((err) => {
          console.error('[ProfileUIClient] Failed to refresh user comments:', err);
          return { comments: [], total: 0, page: 1, limit: 20, hasMore: false };
        }),
      ]);

      // Extract values from Promise.allSettled results
      if (stats.status === 'fulfilled') setStatistics(stats.value);
      if (txs.status === 'fulfilled') setTransactions(txs.value);
      if (pos.status === 'fulfilled') setPositions(pos.value);
      if (commentsData.status === 'fulfilled') setComments(commentsData.value.comments);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const handleEditClick = () => {
    if (user) {
      setEditName(user.displayName || user.username || '');
      setEditAvatarUrl(user.avatarUrl ?? null);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditName(user.displayName || user.username || '');
      setEditAvatarUrl(user.avatarUrl ?? null);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Create preview URL first for immediate feedback
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setEditAvatarUrl(previewUrl);
      };
      reader.readAsDataURL(file);

      // Upload to server and get URL
      const { uploadAvatar } = await import('@/features/user/api/uploadAvatar');
      const uploadedUrl = await uploadAvatar(file);
      
      // Update with the actual uploaded URL
      setEditAvatarUrl(uploadedUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert('頭像上傳失敗，請稍後再試');
      // Reset to original avatar on error
      if (user) {
        setEditAvatarUrl(user.avatarUrl ?? null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (name: string, avatarUrl?: string) => {
    if (!user) return;

    try {
      console.log("[handleSave] Saving profile with:", { name, avatarUrl });
      
      // Use editAvatarUrl if avatarUrl is not provided (use current preview/uploaded URL)
      const finalAvatarUrl = avatarUrl || editAvatarUrl || undefined;
      
      // Don't send base64 data URLs - only send actual uploaded URLs
      const avatarUrlToSend = finalAvatarUrl && !finalAvatarUrl.startsWith('data:') 
        ? finalAvatarUrl 
        : undefined;

      console.log("[handleSave] Sending to API:", { displayName: name, avatarUrl: avatarUrlToSend });

      // Update user profile via API
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName: name,
          avatarUrl: avatarUrlToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        console.error("[handleSave] API error:", errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const responseData = await response.json();
      console.log("[handleSave] API response:", responseData);

      // Refresh user data
      const updatedUser = await getMe();
      console.log("[handleSave] Refreshed user data:", updatedUser);
      console.log("[handleSave] Updated avatar URL:", updatedUser?.avatarUrl);
      
      if (updatedUser) {
        setUser(updatedUser);
        setEditName(updatedUser.displayName || updatedUser.username || '');
        // Use the uploaded URL from response or updated user data
        const newAvatarUrl = responseData.avatarUrl || updatedUser.avatarUrl || avatarUrlToSend;
        console.log("[handleSave] Setting avatar URL to:", newAvatarUrl);
        setEditAvatarUrl(newAvatarUrl);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert('更新失敗，請稍後再試');
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
          console.error('[ProfileUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      );
    } catch (error) {
      console.error('[ProfileUIClient] Login error:', error);
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
        setStatistics(null);
        setTransactions([]);
        setPositions([]);
        setComments([]);
        setIsLoggedIn(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[ProfileUIClient] Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">載入中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
  const uiUser = user && statistics ? {
    name: user.displayName || user.username || '用戶',
    avatar: user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous',
    totalAssets: Number(statistics.statistics?.profitRate?.total?.totalAssets || 0),
    inviteCode: user.referralCode && typeof user.referralCode === 'string' ? user.referralCode : undefined,
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
          <ProfileUI
            user={user}
            statistics={statistics}
            transactions={transactions}
            positions={positions}
            comments={comments}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isEditing={isEditing}
            onEditClick={handleEditClick}
            onSave={handleSave}
            onCancel={handleCancel}
            editName={editName}
            onEditNameChange={setEditName}
            editAvatarUrl={editAvatarUrl}
            onAvatarChange={handleAvatarChange}
            onRefresh={handleRefresh}
            isUploading={isUploading}
          />
        </PullToRefresh>
      </div>
    </div>
  );
}
