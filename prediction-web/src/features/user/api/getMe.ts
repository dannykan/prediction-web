/**
 * Get current user (me)
 * Calls BFF /api/me
 * If token expired (401), automatically tries to refresh using silent sign-in
 */

import type { User } from "../types/user";
import { signInWithGoogleSilent } from "@/core/auth/googleSignIn";

// Track if we're currently refreshing to avoid infinite loops
let isRefreshing = false;

export async function getMe(): Promise<User | null> {
  try {
    const response = await fetch("/api/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Don't cache authenticated requests
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh using silent sign-in
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log("[getMe] Token expired, attempting silent sign-in refresh...");
            }
            await signInWithGoogleSilent();
            if (process.env.NODE_ENV === 'development') {
              console.log("[getMe] Silent sign-in successful, retrying getMe...");
            }
            
            // Retry getMe after successful refresh
            const retryResponse = await fetch("/api/me", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              cache: "no-store",
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              isRefreshing = false;
              return data.user || data;
            }
          } catch (refreshError) {
            // Silent refresh failed - this is expected if user is not signed in to Google
            // Only log in development to avoid console noise
            if (process.env.NODE_ENV === 'development') {
              console.log("[getMe] Silent sign-in refresh not available (user may need to manually login):", refreshError);
            }
            // Silent refresh failed, user will need to manually login
          } finally {
            isRefreshing = false;
          }
        }
        return null; // Not authenticated
      }
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend might return { user: {...} } or just the user object
    return data.user || data;
  } catch (error) {
    console.error("[getMe] Failed to fetch current user:", error);
    return null;
  }
}



