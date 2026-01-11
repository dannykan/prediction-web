"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, User, Bell, Menu, LogIn } from "lucide-react";
import { getMe } from "@/features/user/api/getMe";
import { signInWithGooglePopup } from "@/core/auth/googleSignIn";
import { useEffect, useState } from "react";
import type { User } from "@/features/user/types/user";

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  requiresAuth?: boolean;
  type?: "avatar";
}

const navItems: NavItem[] = [
  { icon: Home, label: "瀏覽", href: "/home" },
  { icon: Trophy, label: "排行榜", href: "/leaderboard" },
  { icon: User, label: "我的", href: "/profile", requiresAuth: true, type: "avatar" },
  { icon: Bell, label: "通知", href: "/notifications", requiresAuth: true },
  { icon: Menu, label: "選單", href: "/menu" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.error("[BottomNavigation] Failed to load user:", error);
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
    if (href === "/menu") {
      return false; // Menu doesn't have a page yet
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-2xl border-t bg-[#0B0E1E]/95 border-cyan-500/15 shadow-[0_-6px_24px_rgba(0,0,0,0.4)]">
      <div className="px-6 py-2.5">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            // Hide auth-required items if not logged in
            if (item.requiresAuth && !user && !isLoading) {
              return null;
            }

            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={index}
                href={item.href}
                className="flex flex-col items-center gap-0.5 transition-all hover:scale-110 active:scale-95"
              >
                {item.type === "avatar" ? (
                  <div
                    className={`w-[22px] h-[22px] rounded-full overflow-hidden border-2 flex items-center justify-center ${
                      active
                        ? "border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                        : "border-gray-500"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #B620E0)",
                    }}
                  >
                    <span className="text-[10px]">👤</span>
                  </div>
                ) : (
                  <Icon
                    size={22}
                    className={active ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]" : "text-gray-500"}
                  />
                )}
                <span
                  className={`text-[9px] font-bold transition-colors ${
                    active ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Login button if not logged in */}
          {!user && !isLoading && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                if (isSigningIn) return;
                
                setIsSigningIn(true);
                try {
                  await signInWithGooglePopup(
                    async () => {
                      // Login successful - reload user data and refresh page
                      try {
                        const userData = await getMe();
                        setUser(userData);
                        router.refresh();
                      } catch (error) {
                        console.error("[BottomNavigation] Failed to reload user after login:", error);
                        router.refresh();
                      }
                    },
                    (error) => {
                      alert(`登入失敗: ${error}`);
                    }
                  );
                } catch (error) {
                  console.error("[BottomNavigation] Sign in error:", error);
                  alert(`登入錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`);
                } finally {
                  setIsSigningIn(false);
                }
              }}
              disabled={isSigningIn}
              className="flex flex-col items-center gap-0.5 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            >
              <LogIn
                size={22}
                className={isSigningIn ? "text-gray-400" : "text-gray-500"}
              />
              <span className="text-[9px] font-bold text-gray-500">
                {isSigningIn ? "登入中" : "登入"}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

