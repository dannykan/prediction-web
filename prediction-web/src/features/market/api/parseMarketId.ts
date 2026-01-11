/**
 * Parse market ID from URL format: ${shortcode}-${slug}
 * Returns shortcode and slugFromUrl (may differ from canonical slug)
 */
export function parseMarketId(id: string): {
  shortcode: string;
  slugFromUrl: string | null;
} {
  const firstDashIndex = id.indexOf("-");

  if (firstDashIndex === -1) {
    // No dash found, entire id is shortcode
    return {
      shortcode: id,
      slugFromUrl: null,
    };
  }

  const shortcode = id.slice(0, firstDashIndex);
  const slugFromUrl = id.slice(firstDashIndex + 1);

  return {
    shortcode,
    slugFromUrl: slugFromUrl || null,
  };
}


