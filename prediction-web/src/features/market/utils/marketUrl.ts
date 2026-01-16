import { normalizeUrlPart } from "../api/normalizeMarket";

/**
 * Build market URL with normalized shortcode and slug
 * Ensures all symbols are replaced with hyphens to prevent URL breaking on social platforms
 * 
 * @param shortcode - Market shortcode
 * @param slug - Market slug (from title)
 * @param queryParams - Optional query parameters (e.g., { comment: '123' })
 * @returns Normalized market URL (e.g., /m/ABC123-market-title)
 */
export function buildMarketUrl(
  shortcode: string,
  slug: string,
  queryParams?: Record<string, string>
): string {
  // Normalize both shortcode and slug to ensure no symbols break URLs
  const normalizedShortcode = normalizeUrlPart(shortcode);
  const normalizedSlug = normalizeUrlPart(slug);
  
  // Build base URL
  let url = `/m/${normalizedShortcode}-${normalizedSlug}`;
  
  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = new URLSearchParams(queryParams).toString();
    url += `?${queryString}`;
  }
  
  return url;
}
