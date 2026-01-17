"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bug, Lightbulb, MessageSquare, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { getMe } from '@/features/user/api/getMe';
import { getUserStatistics } from '@/features/user/api/getUserStatistics';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';

type FeedbackType = 'bug' | 'suggestion' | 'idea' | 'other';

interface FeedbackTypeOption {
  id: FeedbackType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function FeedbackUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getMe().catch(() => null);
        if (!userData) {
          // Redirect to home if not logged in (only once)
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push('/home');
          }
          return;
        }
        setUser(userData);
        
        if (userData?.id) {
          try {
            const stats = await getUserStatistics(userData.id);
            if (stats) {
              setStatistics(stats);
            }
          } catch (error) {
            console.error('[FeedbackUIClient] Failed to load user statistics:', error);
          }
        }
      } catch (error) {
        console.error('[FeedbackUIClient] Failed to load user:', error);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/home');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feedbackTypes: FeedbackTypeOption[] = [
    {
      id: 'bug',
      label: '程式Bug',
      icon: <Bug className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      id: 'suggestion',
      label: '意見反饋',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'idea',
      label: '題目靈感',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100'
    },
    {
      id: 'other',
      label: '其他問題',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 border-slate-200 hover:bg-slate-100'
    }
  ];

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('反饋頁面已刷新');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !content.trim()) {
      return;
    }

    if (!user) {
      alert('請先登入');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: selectedType,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      setShowSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedType(null);
        setContent('');
      }, 2000);
    } catch (error) {
      console.error('[FeedbackUIClient] Failed to submit feedback:', error);
      alert('提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          window.location.reload();
        },
        (error) => {
          alert(`登入失敗: ${error}`);
        }
      );
    } catch (error) {
      console.error('[FeedbackUIClient] Sign in error:', error);
      alert(`登入錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
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
        router.push('/');
        router.refresh();
      } else {
        alert('登出失敗，請重試');
      }
    } catch (error) {
      console.error('[FeedbackUIClient] Logout error:', error);
      alert('登出錯誤，請重試');
    }
  };

  const isFormValid = selectedType && content.trim();
  const isLoggedIn = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <MobileHeaderUI 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={statistics ? {
          totalAssets: statistics.statistics.profitRate.total.totalAssets,
          avatar: user?.avatarUrl || ''
        } : undefined}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <SidebarUI 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={user ? {
            name: user.displayName || user.username || '用戶',
            avatar: user.avatarUrl || '',
            totalAssets: statistics?.statistics.profitRate.total.totalAssets || 0,
            inviteCode: user.referralCode || undefined
          } : undefined}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm mb-4"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span>返回</span>
              </button>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                問題反饋
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                您的反饋對我們非常重要，我們會認真閱讀每一條建議
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-900 mb-0.5">提交成功！</div>
                  <div className="text-sm text-green-700">感謝您的反饋，我們會盡快處理</div>
                </div>
              </div>
            )}

            {/* Feedback Type Selection */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                選擇反饋類型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2.5 p-3.5 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : `${type.bgColor} border-transparent`
                    }`}
                  >
                    <div className={selectedType === type.id ? 'text-indigo-600' : type.color}>
                      {type.icon}
                    </div>
                    <span className={`font-medium text-sm ${
                      selectedType === type.id ? 'text-indigo-900' : 'text-slate-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
              {/* Content Textarea */}
              <div className="mb-5">
                <label htmlFor="content" className="block text-sm font-semibold text-slate-900 mb-2">
                  詳細說明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="請詳細描述您遇到的問題或想法，這將幫助我們更好地理解和改進"
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {content.length}/1000
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  !isFormValid || isSubmitting
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>提交反饋</span>
                  </>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <div className="font-semibold mb-1">提交前提醒</div>
                  <ul className="space-y-1 text-blue-800">
                    <li>• 請確保您的問題描述清楚完整</li>
                    <li>• 如遇到程式Bug，請盡可能描述重現步驟</li>
                    <li>• 我們會在1-3個工作日內回覆您的反饋</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </PullToRefresh>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
