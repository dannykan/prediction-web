/**
 * Get market shortcode by market ID (Client-side only)
 * This is a fallback when shortcode is not available in comment data
 */

export async function getMarketShortcodeById(marketId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/markets/${encodeURIComponent(marketId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "default",
      },
    );

    if (!response.ok) {
      console.error(`[getMarketShortcodeById] Failed to fetch market ${marketId}: ${response.statusText}`);
      return null;
    }

    const market = await response.json() as { shortcode?: string; shortCode?: string };

    // Backend returns shortCode (camelCase), normalize to shortcode
    return market.shortcode || market.shortCode || null;
  } catch (error) {
    console.error(`[getMarketShortcodeById] Failed to fetch market ${marketId}:`, error);
    return null;
  }
}

