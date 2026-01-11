/**
 * Get current user (me)
 * Calls BFF /api/me
 */

import type { User } from "../types/user";

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



