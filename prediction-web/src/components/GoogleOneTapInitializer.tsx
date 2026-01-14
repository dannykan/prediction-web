"use client";

import { useEffect } from "react";
import { initializeGoogleSignIn } from "@/core/auth/googleSignIn";
import { getMe } from "@/features/user/api/getMe";

/**
 * Component to initialize Google One Tap on page load
 * Only initializes if user is not already logged in
 * This enables automatic sign-in if user has previously authorized
 * 
 * Note: FedCM warnings are expected and don't affect functionality.
 * They're related to Google's future migration plans.
 */
export function GoogleOneTapInitializer() {
  useEffect(() => {
    // Check if user is already logged in before initializing One Tap
    // This prevents unnecessary warnings when user is already authenticated
    const checkAndInitialize = async () => {
      try {
        const user = await getMe();
        
        // Only initialize One Tap if user is NOT logged in
        if (!user) {
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
        } else {
          // User is already logged in, skip One Tap initialization
          if (process.env.NODE_ENV === 'development') {
            console.log("[GoogleOneTapInitializer] User already logged in, skipping One Tap initialization");
          }
        }
      } catch (error) {
        // If getMe fails (e.g., network error), still try to initialize One Tap
        // This ensures One Tap works even if the check fails
        if (process.env.NODE_ENV === 'development') {
          console.log("[GoogleOneTapInitializer] Failed to check user status, initializing One Tap anyway:", error);
        }
        initializeGoogleSignIn(true).catch(() => {
          // Silently fail
        });
      }
    };

    checkAndInitialize();
  }, []);

  return null; // This component doesn't render anything
}
