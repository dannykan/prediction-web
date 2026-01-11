/**
 * Server-side BFF fetch wrapper
 * Calls Next.js API routes (BFF) from Server Components
 * Uses absolute URL to call internal API routes
 */

import { headers, cookies } from "next/headers";

interface BffServerFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
  };
}

/**
 * Get the base URL for Next.js app
 * Uses headers() to get the current request's host
 * Falls back to environment variables or localhost
 */
async function getNextJsBaseUrl(): Promise<string> {
  try {
    // Try to get host from request headers (works in Server Components)
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (error) {
    // If headers() is not available, fall back to env vars
    console.warn("[bffServerFetch] Could not get host from headers, using fallback");
  }

  // Fallback: Check if we have a public URL set (for production)
  const publicUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (publicUrl) {
    return publicUrl;
  }

  // For development, use localhost with port from env or default 3000
  const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || "3000";
  return `http://localhost:${port}`;
}

/**
 * Server-side fetch wrapper for BFF API routes
 * @param path - API endpoint path (e.g., "/api/markets")
 * @param options - Fetch options including Next.js revalidation
 * @returns Response data
 * @throws Error if response is not 2xx
 */
export async function bffServerFetch<T = unknown>(
  path: string,
  options?: BffServerFetchOptions,
): Promise<T> {
  const baseUrl = await getNextJsBaseUrl();
  const fullUrl = `${baseUrl}${path}`;

  // Extract Next.js revalidation options
  const { next, ...fetchOptions } = options || {};

  // Get cookies to pass to internal API routes for authentication
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Build fetch options with Next.js cache control
  const requestOptions: RequestInit & { next?: { revalidate?: number | false } } = {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      // Pass cookies for authentication (needed when calling internal API routes from Server Components)
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...fetchOptions.headers,
    },
  };

  // Add Next.js revalidation if specified
  if (next?.revalidate !== undefined) {
    if (next.revalidate === false) {
      requestOptions.cache = "no-store";
    } else {
      // Next.js extends fetch with 'next' option
      (requestOptions as any).next = { revalidate: next.revalidate };
    }
  }

  const response = await fetch(fullUrl, requestOptions as RequestInit);

  // Handle non-2xx responses
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    const error = new Error(
      `BFF API request failed: ${response.status} ${response.statusText}\n` +
        `URL: ${fullUrl}\n` +
        `Response: ${errorText.substring(0, 200)}${errorText.length > 200 ? "..." : ""}`,
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  // Parse JSON response
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

