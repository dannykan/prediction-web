"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, CreditCard, Shield, Zap } from "lucide-react";
import { SidebarUI } from "../SidebarUI";
import { MobileHeaderUI } from "../MobileHeaderUI";
import { TopupCard } from "./TopupCard";
import { TopupSuccessBanner } from "./TopupSuccessBanner";
import { PullToRefresh } from "../PullToRefresh";
import { GCoinIcon } from "@/components/GCoinIcon";
import { getMe } from "@/features/user/api/getMe";
import { getUserStatistics } from "@/features/user/api/getUserStatistics";
import { signInWithGooglePopup } from "@/core/auth/googleSignIn";
import type { User } from "@/features/user/types/user";
import type { UserStatistics } from "@/features/user/types/user-statistics";

export function TopupUIClient() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ gcoins: number; price: number } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [topupEnabled, setTopupEnabled] = useState(true);
  const [topupStatus, setTopupStatus] = useState<string>("approved");

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. 检查储值功能状态
        try {
          const statusResponse = await fetch("/api/topup/status-check", {
            credentials: "include",
          });
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setTopupEnabled(statusData.enabled);
            setTopupStatus(statusData.status);
          }
        } catch (error) {
          console.error("Failed to check topup status:", error);
          // 默认设为未启用，显示审核中
          setTopupEnabled(false);
          setTopupStatus("pending");
        }

        // 2. 获取用户数据（需要登录）
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

  const topupPackages = [
    { gcoins: 500, price: 50, isPopular: false, isBestValue: false },
    { gcoins: 1200, price: 100, isPopular: true, isBestValue: false, bonusPercent: 20 },
    { gcoins: 7000, price: 500, isPopular: false, isBestValue: true, bonusPercent: 40 },
    { gcoins: 15000, price: 1000, isPopular: false, isBestValue: false, bonusPercent: 50 },
  ];

  const handleSelectPackage = async (gcoins: number, price: number) => {
    // 检查功能是否启用
    if (!topupEnabled) {
      // 显示审核中提示
      alert(topupStatus === "pending" 
        ? "儲值功能審核中，敬請期待！" 
        : "儲值功能暫未開放，請稍後再試。");
      return;
    }

    try {
      // 调用后端创建订单
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          gcoins,
          price,
          paymentMethod: "credit_card",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 503) {
          // 功能未启用，显示审核中提示
          alert(errorData.message || "儲值功能審核中，敬請期待！");
          return;
        }
        throw new Error(errorData.message || "创建订单失败");
      }

      const { orderId, paymentForm } = await response.json();

      // 创建表单并提交到绿界
      const ecpayUrl = process.env.NEXT_PUBLIC_ECPAY_URL || 
        "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
      
      const form = document.createElement("form");
      form.method = "POST";
      form.action = ecpayUrl;

      Object.keys(paymentForm).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentForm[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("创建订单失败:", error);
      alert("创建订单失败，请稍后重试");
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    const userData = await getMe();
    if (userData) {
      setUser(userData);
      const stats = await getUserStatistics(userData.id);
      setStatistics(stats);
    }
  };

  const handleCloseBanner = () => {
    setShowSuccessBanner(false);
    setSelectedPackage(null);
  };

  const handleLogin = async () => {
    try {
      await signInWithGooglePopup(
        async () => {
          window.location.reload();
        },
        (error) => {
          console.error("[TopupUIClient] Login failed:", error);
        }
      );
    } catch (error) {
      console.error("[TopupUIClient] Login error:", error);
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
      console.error("[TopupUIClient] Logout error:", error);
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
          <div className="max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">返回</span>
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
                    儲值 G Coin
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    選擇最適合你的儲值方案
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/topup-history")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:border-indigo-400 transition-colors"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">儲值記錄</span>
              </button>
            </div>

            {/* Current Balance */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 md:p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between text-white">
                <div>
                  <div className="text-sm md:text-base opacity-90 mb-1">目前餘額</div>
                  <div className="flex items-center gap-2">
                    <GCoinIcon size={40} priority={false} />
                    <span className="text-3xl md:text-4xl font-bold">{totalAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">支援多種支付</div>
                  <div className="text-sm font-semibold text-slate-900">信用卡 / Apple Pay</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">安全保障</div>
                  <div className="text-sm font-semibold text-slate-900">SSL 加密交易</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">即時到帳</div>
                  <div className="text-sm font-semibold text-slate-900">立即使用</div>
                </div>
              </div>
            </div>

            {/* Topup Packages */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">選擇方案</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topupPackages.map((pkg) => (
                  <TopupCard
                    key={pkg.gcoins}
                    gcoins={pkg.gcoins}
                    price={pkg.price}
                    isPopular={pkg.isPopular}
                    isBestValue={pkg.isBestValue}
                    bonusPercent={pkg.bonusPercent}
                    onSelect={() => handleSelectPackage(pkg.gcoins, pkg.price)}
                  />
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 mb-6">
              <div className="flex gap-3">
                <div className="text-2xl flex-shrink-0">ℹ️</div>
                <div className="text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">溫馨提示</p>
                  <ul className="list-disc list-inside space-y-1 text-xs md:text-sm">
                    <li>G Coin 僅供平台內使用，無法兌換為現金</li>
                    <li>儲值後 G Coin 將立即到帳，可馬上進行預測</li>
                    <li>兌換比例：10 G Coin = 1 TWD</li>
                    <li>如有任何問題，請聯繫客服</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seller Information - ECPay Verified */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base">賣家資訊</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      綠界驗證通過
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 min-w-[60px]">賣家名稱</span>
                      <span className="font-medium">神預測 Prediction God</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 min-w-[60px]">聯絡信箱</span>
                      <a href="mailto:predictiongod.app@gmail.com" className="font-medium text-indigo-600 hover:underline break-all">
                        predictiongod.app@gmail.com
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                    * 以上資訊與綠界科技賣家資料驗證通過之聯絡資訊相同
                  </p>
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

      {/* Success Banner */}
      {selectedPackage && (
        <TopupSuccessBanner
          isVisible={showSuccessBanner}
          gcoins={selectedPackage.gcoins}
          price={selectedPackage.price}
          onClose={handleCloseBanner}
        />
      )}
    </div>
  );
}
