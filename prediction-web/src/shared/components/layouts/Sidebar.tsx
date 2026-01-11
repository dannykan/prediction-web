"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Trophy, 
  User as UserIcon, 
  Bell,
  TrendingUp,
  // Settings, // Removed - Settings page removed
  LogIn,
  LogOut,
  Plus,
  Menu as MenuIcon,
  X,
  Gift,
  Users,
  Copy,
  Check,
  Send
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/features/user/api/getMe";
import { getUserStatistics } from "@/features/user/api/getUserStatistics";
import { signInWithGooglePopup } from "@/core/auth/googleSignIn";
import { applyReferralCode } from "@/features/referrals/api/applyReferralCode";
import type { User } from "@/features/user/types/user";
import type { UserStatistics } from "@/features/user/types/user-statistics";
import Image from "next/image";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen: controlledIsOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isApplyingReferralCode, setIsApplyingReferralCode] = useState(false);
  const [referralCodeError, setReferralCodeError] = useState<string | null>(null);
  const [referralCodeSuccess, setReferralCodeSuccess] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isMobileOpen;
  const setIsOpen = controlledIsOpen !== undefined ? onToggle || (() => {}) : setIsMobileOpen;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getMe().catch(() => null);
        setUser(userData);
        
        // Load user statistics if user is logged in
        if (userData?.id) {
          try {
            const stats = await getUserStatistics(userData.id);
            if (stats) {
              setUserStatistics(stats);
            }
          } catch (error) {
            console.error("[Sidebar] Failed to load user statistics:", error);
          }
        }
      } catch (error) {
        console.error("[Sidebar] Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    { icon: Home, label: "首頁", href: "/home", requiresAuth: false },
    { icon: Trophy, label: "排行榜", href: "/leaderboard", requiresAuth: false },
    { icon: Plus, label: "創建問題", href: "/create-question", requiresAuth: true },
    { icon: Gift, label: "任務", href: "/quests", requiresAuth: true },
    { icon: Bell, label: "通知", href: "/notifications", requiresAuth: true },
    { icon: UserIcon, label: "我的", href: "/profile", requiresAuth: true },
    // Removed Settings - { icon: Settings, label: "設定", href: "/settings", requiresAuth: true },
  ];

  const handleCopyReferralCode = async (referralCode: string) => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedReferralCode(true);
      setTimeout(() => setCopiedReferralCode(false), 2000);
    } catch (error) {
      console.error("[Sidebar] Failed to copy referral code:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedReferralCode(true);
        setTimeout(() => setCopiedReferralCode(false), 2000);
      } catch (err) {
        console.error("[Sidebar] Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Generate or get device ID from localStorage
  const getDeviceId = (): string => {
    const stored = localStorage.getItem("deviceId");
    if (stored) {
      return stored;
    }
    // Generate a simple device ID
    const deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("deviceId", deviceId);
    return deviceId;
  };

  const handleApplyReferralCode = async () => {
    if (!user || !referralCodeInput.trim()) {
      setReferralCodeError("請輸入邀請碼");
      return;
    }

    if (user.referredBy) {
      setReferralCodeError("你已經使用過邀請碼了");
      return;
    }

    setIsApplyingReferralCode(true);
    setReferralCodeError(null);
    setReferralCodeSuccess(false);

    try {
      const deviceId = getDeviceId();
      const result = await applyReferralCode(
        user.id,
        referralCodeInput.trim().toUpperCase(),
        deviceId,
      );

      if (result.success) {
        setReferralCodeSuccess(true);
        setReferralCodeInput("");
        // Reload user data to update referredBy status
        const updatedUser = await getMe();
        if (updatedUser) {
          setUser(updatedUser);
        }
        // Reload statistics to show updated balance
        if (user.id) {
          try {
            const stats = await getUserStatistics(user.id);
            if (stats) {
              setUserStatistics(stats);
            }
          } catch (error) {
            console.error("[Sidebar] Failed to reload statistics:", error);
          }
        }
        // Clear success message after 5 seconds
        setTimeout(() => {
          setReferralCodeSuccess(false);
        }, 5000);
      } else {
        setReferralCodeError(result.message || "申請失敗");
      }
    } catch (error: any) {
      console.error("[Sidebar] Failed to apply referral code:", error);
      setReferralCodeError(error.message || "申請邀請碼失敗，請重試");
    } finally {
      setIsApplyingReferralCode(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed md:top-0 left-0 h-screen z-50
          bg-gray-900 dark:bg-gray-950 border-r border-gray-800
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64 overflow-y-auto
          pt-16 md:pt-0
          flex flex-col
        `}
      >
        <div className="p-4 md:p-6 flex flex-col flex-1 min-h-0">
          {/* Logo/Brand */}
          <Link href="/home" className="block mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              神預測
            </h1>
            <p className="text-sm text-gray-400">Prediction God</p>
          </Link>

          {/* User Info (if logged in) - Clickable to profile page */}
          {user && !isLoading && (
            <Link
              href="/profile"
              onClick={() => {
                // Close mobile sidebar when clicking user info
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              className="block mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName || user.username || "User"}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600">
                    <span className="text-white font-bold text-lg">
                      {(user.displayName || user.username || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {user.displayName || user.username || "用戶"}
                  </p>
                </div>
              </div>
              {/* Total Assets */}
              {userStatistics && (
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">G coin 總資產</p>
                  <p className="text-white font-bold text-lg">
                    {userStatistics.statistics.profitRate.total.totalAssets.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </Link>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              // Hide auth-required items if not logged in
              if (item.requiresAuth && !user && !isLoading) {
                return null;
              }

              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.requiresAuth && !user ? "#" : item.href}
                  onClick={() => {
                    // Close mobile sidebar when clicking a link
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Referral Code Section - Only show when logged in */}
            {user && !isLoading && (
              <div className="space-y-3">
                {/* My Referral Code - Only show if user has referral code */}
                {user.referralCode && (
                  <div
                    className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700"
                    onClick={(e) => {
                      // Close mobile sidebar when clicking outside input
                      if (window.innerWidth < 768 && e.target === e.currentTarget) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={20} className="text-gray-300" />
                      <span className="font-medium text-gray-300">我的邀請碼</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-gray-900 rounded text-white font-mono text-sm font-bold">
                        {user.referralCode}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyReferralCode(user.referralCode!);
                        }}
                        className={`
                          p-2 rounded transition-colors
                          ${copiedReferralCode 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                          }
                        `}
                        title={copiedReferralCode ? "已複製" : "複製邀請碼"}
                      >
                        {copiedReferralCode ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      💰 邀請成功後，雙方皆可獲得 1,000 G coin 獎勵
                    </p>
                  </div>
                )}

                {/* Apply Referral Code - Only show if user hasn't used a referral code */}
                {!user.referredBy && (
                  <div
                    className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700"
                    onClick={(e) => {
                      // Close mobile sidebar when clicking outside input
                      if (window.innerWidth < 768 && e.target === e.currentTarget) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Gift size={20} className="text-gray-300" />
                      <span className="font-medium text-gray-300">輸入邀請碼</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={referralCodeInput}
                          onChange={(e) => {
                            setReferralCodeInput(e.target.value.toUpperCase());
                            setReferralCodeError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isApplyingReferralCode) {
                              handleApplyReferralCode();
                            }
                          }}
                          placeholder="輸入邀請碼"
                          maxLength={8}
                          className="w-32 px-3 py-2 bg-gray-900 rounded text-white font-mono text-sm border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyReferralCode();
                          }}
                          disabled={isApplyingReferralCode || !referralCodeInput.trim()}
                          className={`
                            p-2 rounded transition-colors
                            ${isApplyingReferralCode || !referralCodeInput.trim()
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                            }
                          `}
                          title="申請邀請碼"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      {referralCodeError && (
                        <p className="text-xs text-red-400">{referralCodeError}</p>
                      )}
                      {referralCodeSuccess && (
                        <p className="text-xs text-green-400">
                          ✅ 邀請碼申請成功！你已獲得 1,000 G coin 獎勵
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        💰 使用邀請碼後，雙方皆可獲得 1,000 G coin 獎勵
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && !isLoading && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                  
                  if (isSigningIn) return;
                  
                  setIsSigningIn(true);
                  try {
                    await signInWithGooglePopup(
                      async () => {
                        // Login successful - reload user data and refresh page
                        try {
                          const userData = await getMe();
                          setUser(userData);
                          
                          if (userData?.id) {
                            try {
                              const stats = await getUserStatistics(userData.id);
                              if (stats) {
                                setUserStatistics(stats);
                              }
                            } catch (error) {
                              console.error("[Sidebar] Failed to load user statistics:", error);
                            }
                          }
                          
                          // Refresh the page to update all components
                          router.refresh();
                        } catch (error) {
                          console.error("[Sidebar] Failed to reload user after login:", error);
                          // Still refresh the page
                          router.refresh();
                        }
                      },
                      (error) => {
                        alert(`登入失敗: ${error}`);
                      }
                    );
                  } catch (error) {
                    console.error("[Sidebar] Sign in error:", error);
                    alert(`登入錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`);
                  } finally {
                    setIsSigningIn(false);
                  }
                }}
                disabled={isSigningIn}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left
                  transition-colors
                  ${isSigningIn 
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <LogIn size={20} />
                <span className="font-medium">{isSigningIn ? "登入中..." : "登入"}</span>
              </button>
            )}
          </nav>

          {/* Logout Button (only shown when logged in) */}
          {user && !isLoading && (
            <div className="mt-auto pt-4 border-t border-gray-800/50">
              <button
                onClick={async () => {
                  try {
                    // Call logout API
                    const response = await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });

                    if (response.ok) {
                      // Clear user state
                      setUser(null);
                      setUserStatistics(null);
                      
                      // Close mobile sidebar if open
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                      
                      // Redirect to homepage after logout
                      router.push("/");
                      router.refresh();
                    } else {
                      console.error("[Sidebar] Logout failed");
                      alert("登出失敗，請重試");
                    }
                  } catch (error) {
                    console.error("[Sidebar] Logout error:", error);
                    alert("登出錯誤，請重試");
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-500 hover:bg-gray-800/30 transition-colors text-xs opacity-70 hover:opacity-100"
              >
                <LogOut size={16} />
                <span>登出</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

