/**
 * Get user by ID - Server Component version
 * Calls BFF /api/users/[id] (which forwards to backend)
 */

import type { User } from "../types/user";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

/**
 * Note: In Server Components, we can call BFF route handlers directly
 * by constructing the full URL. However, for consistency with the architecture,
 * we call the backend API directly here (BFF route handler will be used by client components).
 * 
 * Alternatively, we could call the BFF route handler using the internal URL,
 * but that requires knowing the base URL of the Next.js app.
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Call backend directly (BFF route handler is for client components)
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Allow caching for user profiles
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend might return { user: {...} } or just the user object
    return data.user || data;
  } catch (error) {
    console.error("[getUserById] Failed to fetch user:", error);
    return null;
  }
}

