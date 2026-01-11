/**
 * Get market by code (alias for getMarketByShortcode)
 * Calls BFF /api/markets/by-code/[code]
 */

import { getMarketByShortcode } from "./getMarketByShortcode";
import type { Market } from "../types/market";

/**
 * Get market by code
 * @param code - Market code (shortcode)
 * @param revalidate - ISR revalidation time in seconds (default: 60)
 * @returns Normalized Market object or null if not found
 */
export async function getMarketByCode(
  code: string,
  revalidate: number | false = 60,
): Promise<Market | null> {
  return getMarketByShortcode(code, revalidate);
}



