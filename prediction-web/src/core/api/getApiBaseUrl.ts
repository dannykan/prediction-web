/**
 * Get API base URL from environment variable
 * Throws error at runtime if not set (but allows build to succeed)
 */
export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  
  return apiBaseUrl;
}
