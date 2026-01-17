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
        // 401 Unauthorized is expected for unauthenticated users
        // Don't attempt silent refresh here - it causes unnecessary requests
        // If user needs to login, they should do so explicitly
        // Return null silently - this is normal for unauthenticated users
        return null;
      }
      // For other errors (500, etc.), log and return null
      if (process.env.NODE_ENV === 'development') {
        console.warn("[getMe] Unexpected error:", response.status, response.statusText);
      }
      return null;
    }

    const data = await response.json();
    // Backend might return { user: {...} } or just the user object
    return data.user || data;
  } catch (error) {
    // Only log network errors or unexpected errors, not 401s
    // 401s are handled above and are expected for unauthenticated users
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error - only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn("[getMe] Network error:", error);
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Other unexpected errors - log in development
      console.warn("[getMe] Unexpected error:", error);
    }
    return null;
  }
}



