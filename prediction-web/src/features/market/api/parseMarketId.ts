/**
 * Parse market ID from URL format: ${shortcode}-${slug}
 * Returns shortcode and slugFromUrl (may differ from canonical slug)
 * 
 * Note: Next.js automatically URL-decodes route parameters, so `id` is already decoded
 */
export function parseMarketId(id: string): {
  shortcode: string;
  slugFromUrl: string | null;
} {
  // Next.js automatically URL-decodes route parameters, but we should handle it explicitly
  // in case the id is still encoded (shouldn't happen, but for safety)
  let decodedId = id;
  try {
    // Try to decode if it's still encoded (shouldn't be needed, but safe)
    decodedId = decodeURIComponent(id);
  } catch {
    // If decoding fails, use original (already decoded or invalid)
    decodedId = id;
  }

  const firstDashIndex = decodedId.indexOf("-");

  if (firstDashIndex === -1) {
    // No dash found, entire id is shortcode
    return {
      shortcode: decodedId,
      slugFromUrl: null,
    };
  }

  const shortcode = decodedId.slice(0, firstDashIndex);
  const slugFromUrl = decodedId.slice(firstDashIndex + 1);

  return {
    shortcode,
    slugFromUrl: slugFromUrl || null,
  };
}


