"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { parseToTaipeiTime } from "@/utils/formatDate";
import { SidebarUI } from "../SidebarUI";
import { MobileHeaderUI } from "../MobileHeaderUI";
import { PullToRefresh } from "../PullToRefresh";
import { GCoinIcon } from "@/components/GCoinIcon";
import { getMe } from "@/features/user/api/getMe";
import { getUserStatistics } from "@/features/user/api/getUserStatistics";
import { signInWithGooglePopup } from "@/core/auth/googleSignIn";
import type { User } from "@/features/user/types/user";
import type { UserStatistics } from "@/features/user/types/user-statistics";

export function TopupHistoryUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "thisMonth" | "lastMonth">("all");
  const [user, setUser] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getMe();
        if (!userData) {
          router.push("/");
          return;
        }
        setUser(userData);

        const stats = await getUserStatistics(userData.id);
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  // Mock topup history data - TODO: Replace with actual API call
  const mockHistory = [
    {
      id: 1,
      gcoins: 15000,
      price: 1000,
      status: "success" as const,
      paymentMethod: "信用卡",
      transactionId: "TXN-2026011701",
      time: new Date("2026-01-17T10:30:00"),
    },
    {
      id: 2,
      gcoins: 7000,
      price: 500,
      status: "success" as const,
      paymentMethod: "LINE Pay",
      transactionId: "TXN-2026011502",
      time: new Date("2026-01-15T14:20:00"),
    },
    {
      id: 3,
      gcoins: 1200,
      price: 100,
      status: "success" as const,
      paymentMethod: "信用卡",
      transactionId: "TXN-2026011203",
      time: new Date("2026-01-12T09:15:00"),
    },
    {
      id: 4,
      gcoins: 500,
      price: 50,
      status: "success" as const,
      paymentMethod: "信用卡",
      transactionId: "TXN-2026010804",
      time: new Date("2026-01-08T16:45:00"),
    },
    {
      id: 5,
      gcoins: 7000,
      price: 500,
      status: "success" as const,
      paymentMethod: "LINE Pay",
      transactionId: "TXN-2026010305",
      time: new Date("2026-01-03T11:00:00"),
    },
  ];

  // Calculate total topup
  const totalTopup = mockHistory.reduce((sum, item) => sum + item.price, 0);
  const totalGcoins = mockHistory.reduce((sum, item) => sum + item.gcoins, 0);

  const handleRefresh = async () => {
    if (!user) return;
    const userData = await getMe();
    if (userData) {
      setUser(userData);
      const stats = await getUserStatistics(userData.id);
      setStatistics(stats);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          window.location.reload();
        },
        (error) => {
          console.error("[TopupHistoryUIClient] Login failed:", error);
        }
      );
    } catch (error) {
      console.error("[TopupHistoryUIClient] Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        setStatistics(null);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("[TopupHistoryUIClient] Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalAssets = statistics?.statistics.profitRate.total.totalAssets || 0;
  
  // Prepare user data for Sidebar and MobileHeader
  const uiUser = user && statistics ? {
    name: user.displayName || user.username || "用戶",
    avatar: user.avatarUrl || "https://i.pravatar.cc/150?u=anonymous",
    totalAssets: Number(totalAssets || 0),
    inviteCode: user.referralCode && typeof user.referralCode === "string" ? user.referralCode : undefined,
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <MobileHeaderUI 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={!!user}
        user={uiUser}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <SidebarUI 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={!!user}
          user={uiUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
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
                儲值記錄
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                查看你的所有儲值交易記錄
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm opacity-90">累計儲值</div>
                  <Calendar className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  NT$ {totalTopup.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-sm opacity-90">
                  <GCoinIcon size={16} priority={false} />
                  <span>{totalGcoins.toLocaleString()} G Coin</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-slate-600">交易筆數</div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {mockHistory.length}
                </div>
                <div className="text-sm text-slate-500">
                  全部成功
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex items-center gap-2 overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === "all"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setSelectedFilter("thisMonth")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === "thisMonth"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  本月
                </button>
                <button
                  onClick={() => setSelectedFilter("lastMonth")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === "lastMonth"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  上月
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm md:text-base mb-1">
                          儲值成功
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{item.paymentMethod}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(parseToTaipeiTime(item.time) || item.time, { addSuffix: true, locale: zhTW })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end mb-1">
                        <GCoinIcon size={16} priority={false} />
                        <span className="font-bold text-slate-900 text-sm md:text-base">
                          +{item.gcoins.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        NT$ {item.price}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">交易編號</span>
                    <span className="text-slate-700 font-mono">{item.transactionId}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (if no history) */}
            {mockHistory.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">尚無儲值記錄</h3>
                <p className="text-sm text-slate-500 mb-6">開始你的第一筆儲值，暢玩預測市場！</p>
                <button
                  onClick={() => router.push("/topup")}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  前往儲值
                </button>
              </div>
            )}
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
