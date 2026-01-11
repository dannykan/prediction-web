import ky from "ky";

/**
 * API client instance (Phase 0: placeholder)
 * TODO: Configure with real API base URL in Phase 1
 */
export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://example.com",
  timeout: 30000,
});

/**
 * Client-side fetch function that works in browser/client components
 * Automatically includes cookies via credentials: 'include'
 */
export async function clientFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // Use relative path for BFF routes (they handle auth via cookies)
  const url = path.startsWith("http") ? path : path;
  
  // Merge cache option if provided
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // Include cookies automatically
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };
  
  // If cache option is provided, add it to fetch options
  if ('cache' in options) {
    fetchOptions.cache = options.cache;
  }
  
  return fetch(url, fetchOptions);
}
