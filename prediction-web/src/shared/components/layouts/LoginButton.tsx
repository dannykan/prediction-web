"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/features/user/api/getMe";
import { signInWithGooglePopup } from "@/core/auth/googleSignIn";

export function LoginButton() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      await signInWithGooglePopup(
        async () => {
          // Login successful - reload user data and refresh page
          try {
            await getMe(); // Verify login was successful
            router.refresh(); // Refresh the page to update all components
          } catch (error) {
            console.error("[LoginButton] Failed to reload user after login:", error);
            router.refresh(); // Still refresh the page
          }
        },
        (error) => {
          alert(`登入失敗: ${error}`);
        }
      );
    } catch (error) {
      console.error("[LoginButton] Sign in error:", error);
      alert(`登入錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isSigningIn}
      className="text-xs md:text-sm font-medium hover:text-primary transition-colors px-2 py-1 md:px-0 md:py-0 disabled:opacity-50"
    >
      {isSigningIn ? "登入中..." : "登入"}
    </button>
  );
}
