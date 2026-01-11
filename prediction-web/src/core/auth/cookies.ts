/**
 * Cookie utility functions for authentication
 */

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "pg_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get authentication token from cookie
 * Works in both Server Components and API Routes
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || null;
  } catch (error) {
    // If cookies() is not available (e.g., in some edge cases), return null
    return null;
  }
}

/**
 * Get authentication token from request (for API Routes)
 * Tries to get from cookies() first, then from Cookie header (for internal API calls)
 */
export async function getAuthTokenFromRequest(request?: NextRequest): Promise<string | null> {
  // First, try to get from cookies() (works for external requests)
  const tokenFromCookies = await getAuthToken();
  if (tokenFromCookies) {
    return tokenFromCookies;
  }

  // If no token from cookies, try to get from Cookie header (for internal API calls from Server Components)
  if (request) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
        const [name, value] = cookie.split("=");
        if (name && value) {
          acc[name.trim()] = decodeURIComponent(value.trim());
        }
        return acc;
      }, {} as Record<string, string>);
      return cookies[COOKIE_NAME] || null;
    }
  }

  return null;
}

/**
 * Set authentication token in cookie
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction, // Only use secure in production (HTTPS)
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clear authentication token from cookie
 */
export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

