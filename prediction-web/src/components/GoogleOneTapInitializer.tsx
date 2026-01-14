"use client";

import { useEffect } from "react";
import { initializeGoogleSignIn } from "@/core/auth/googleSignIn";

/**
 * Component to initialize Google One Tap on page load
 * This enables automatic sign-in if user has previously authorized
 */
export function GoogleOneTapInitializer() {
  useEffect(() => {
    // Initialize Google One Tap for automatic sign-in
    // This will automatically sign in users who have previously authorized
    initializeGoogleSignIn(true).catch((error) => {
      console.warn("[GoogleOneTapInitializer] Failed to initialize One Tap:", error);
      // Don't show error to user, just log it
    });
  }, []);

  return null; // This component doesn't render anything
}
