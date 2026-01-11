/**
 * Get current user (me) - Server Component version
 * Calls BFF /api/me
 */

import type { User } from "../types/user";
import { getAuthToken } from "@/core/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export async function getMeServer(): Promise<User | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return null; // Not authenticated
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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
    console.error("[getMeServer] Failed to fetch current user:", error);
    return null;
  }
}



