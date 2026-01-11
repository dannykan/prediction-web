/**
 * API endpoints (Phase 0: placeholder)
 * TODO: Define real endpoints in Phase 1
 */
export const endpoints = {
  markets: "/markets",
  marketByShortcode: (shortcode: string) => `/markets/${shortcode}`,
} as const;


