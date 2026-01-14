"use client";

import { useEffect } from "react";
import { initializeGoogleSignIn } from "@/core/auth/googleSignIn";

/**
 * Component to initialize Google One Tap on page load
 * This enables automatic sign-in if user has previously authorized
 * 
 * Note: FedCM warnings are expected and don't affect functionality.
 * They're related to Google's future migration plans.
 */
export function GoogleOneTapInitializer() {
  useEffect(() => {
    // Initialize Google One Tap for automatic sign-in
    // This will automatically sign in users who have previously authorized
    // Errors are expected in some browsers (FedCM disabled, etc.) and are handled silently
    initializeGoogleSignIn(true).catch((error) => {
      // Only log in development - FedCM errors are expected in some browsers
      if (process.env.NODE_ENV === 'development') {
        console.log("[GoogleOneTapInitializer] One Tap initialization (expected to fail in some browsers):", error);
      }
      // Don't show error to user - this is a background enhancement
    });
  }, []);

  return null; // This component doesn't render anything
}
