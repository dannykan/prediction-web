"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReferralsUI } from './ReferralsUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { getReferralStats } from '@/features/referrals/api/getReferralStats';
import { getReferralDetails } from '@/features/referrals/api/getReferralDetails';
import { applyReferralCode } from '@/features/referrals/api/applyReferralCode';
import { getQuests } from '@/features/quests/api/getQuests';
import { getUnreadCount } from '@/features/notification/api/getUnreadCount';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import type { ReferralStats } from '@/features/referrals/api/getReferralStats';
import type { ReferralDetail } from '@/features/referrals/api/getReferralDetails';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';

export function ReferralsUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [details, setDetails] = useState<ReferralDetail[]>([]);
  const [copied, setCopied] = useState(false);
  const [quests, setQuests] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  // Invite code input state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [inviteCodeSuccess, setInviteCodeSuccess] = useState(false);
  const [usedInviteCode, setUsedInviteCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  // Fetch user data and referral data on mount
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

        // Fetch all data in parallel
        const [statisticsData, statsData, detailsData, questsData, unreadCount] = await Promise.all([
          getUserStatistics(userData.id).catch((err) => {
            console.error('[ReferralsUIClient] Failed to load user statistics:', err);
            return null;
          }),
          getReferralStats(userData.id).catch((err) => {
            console.error('[ReferralsUIClient] Failed to load referral stats:', err);
            return null;
          }),
          getReferralDetails(userData.id).catch((err) => {
            console.error('[ReferralsUIClient] Failed to load referral details:', err);
            return [];
          }),
          getQuests(userData.id).catch((err) => {
            console.error('[ReferralsUIClient] Failed to load quests:', err);
            return null;
          }),
          getUnreadCount(userData.id).catch((err) => {
            console.error('[ReferralsUIClient] Failed to load unread notifications count:', err);
            return 0;
          }),
        ]);

        setUserStatistics(statisticsData);
        setStats(statsData);
        setDetails(detailsData);
        setQuests(questsData);
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

  const refreshReferrals = async () => {
    if (!user) return;
    try {
      const [statsData, detailsData] = await Promise.all([
        getReferralStats(user.id).catch((err) => {
          console.error('[ReferralsUIClient] Failed to refresh referral stats:', err);
          return null;
        }),
        getReferralDetails(user.id).catch((err) => {
          console.error('[ReferralsUIClient] Failed to refresh referral details:', err);
          return [];
        }),
      ]);
      setStats(statsData);
      setDetails(detailsData);
    } catch (error) {
      console.error("Failed to refresh referrals:", error);
    }
  };

  const handleRefresh = async () => {
    await refreshReferrals();
  };

  const handleCopyCode = async () => {
    if (stats?.shareUrl) {
      const referralLink = stats.shareUrl || `https://predictiongod.app/home?ref=${stats.referralCode}`;
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = referralLink;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch (fallbackErr) {
          console.error('Failed to copy:', fallbackErr);
        }
      }
    }
  };

  const handleInviteCodeInputChange = (value: string) => {
    setInviteCodeInput(value);
    setInviteCodeError(null);
  };

  const handleInviteCodeSubmit = async () => {
    if (!user || !inviteCodeInput.trim()) {
      setInviteCodeError('請輸入邀請碼');
      return;
    }

    // Can't use own invite code
    if (inviteCodeInput.trim().toUpperCase() === stats?.referralCode) {
      setInviteCodeError('不能使用自己的邀請碼');
      return;
    }

    setIsApplyingCode(true);
    setInviteCodeError(null);
    setInviteCodeSuccess(false);

    try {
      // Generate a device ID (you might want to store this in localStorage)
      const deviceId = localStorage.getItem('deviceId') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('deviceId')) {
        localStorage.setItem('deviceId', deviceId);
      }

      const result = await applyReferralCode(
        user.id,
        inviteCodeInput.trim().toUpperCase(),
        deviceId
      );

      if (result.success) {
        setInviteCodeSuccess(true);
        setUsedInviteCode(inviteCodeInput.trim().toUpperCase());
        setInviteCodeInput('');
        // Refresh user data to get updated referredBy status
        const userData = await getMe();
        if (userData) {
          setUser(userData);
        }
        // Refresh statistics
        await refreshReferrals();
      } else {
        setInviteCodeError(result.message || '申請失敗');
      }
    } catch (error) {
      console.error('[ReferralsUIClient] Failed to apply referral code:', error);
      setInviteCodeError(error instanceof Error ? error.message : '申請邀請碼失敗，請重試');
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleShare = async () => {
    if (stats?.referralCode && stats?.shareUrl) {
      const shareText = `我在預測市場賺翻了！用我的邀請碼 ${stats.referralCode} 註冊，你我各得 50,000 P！\n\n立即加入：${stats.shareUrl}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: '邀請你一起來預測市場',
            text: shareText,
          });
        } catch (err) {
          // User cancelled or error occurred
          console.error('Share failed:', err);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareText);
          alert('分享內容已複製到剪貼板！');
        } catch (err) {
          console.error('Failed to copy share text:', err);
        }
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
          console.error('[ReferralsUIClient] Login failed:', error);
          setIsLoggedIn(false);
          setUser(null);
          setUserStatistics(null);
        }
      );
    } catch (error) {
      console.error('[ReferralsUIClient] Login error:', error);
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
        setStats(null);
        setDetails([]);
        setIsLoggedIn(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[ReferralsUIClient] Logout error:', error);
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

  if (isLoading || !stats) {
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
          <ReferralsUI
            stats={stats}
            details={details}
            onCopyCode={handleCopyCode}
            onShare={handleShare}
            copied={copied}
            inviteCodeUsed={!!user?.referredBy}
            inviteCodeInput={inviteCodeInput}
            onInviteCodeInputChange={handleInviteCodeInputChange}
            onInviteCodeSubmit={handleInviteCodeSubmit}
            inviteCodeError={inviteCodeError}
            inviteCodeSuccess={inviteCodeSuccess}
            usedInviteCode={usedInviteCode}
          />
        </PullToRefresh>
      </div>
    </div>
  );
}
