/**
 * SEO utility functions
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * Generate absolute URL with proper encoding for Chinese characters
 */
export function absUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Encode the path to handle Chinese characters properly
  // Split by '/' and encode each segment separately to preserve path structure
  const encodedPath = cleanPath
    .split('/')
    .map(segment => segment ? encodeURIComponent(segment) : '')
    .join('/');
  return `${baseUrl}${encodedPath}`;
}


