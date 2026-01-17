import type { MetadataRoute } from "next";
import { absUrl } from "@/shared/utils/seo";
import { buildMarketUrl } from "@/features/market/utils/marketUrl";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

// Force dynamic rendering to avoid cookie usage during build
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch markets directly from backend API (no cookies needed for sitemap)
  interface BackendMarketItem {
    shortCode?: string;
    shortcode?: string; // Backend might use either
    slug?: string;
    updatedAt: string;
  }
  
  let markets: BackendMarketItem[] = [];
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/markets?status=OPEN`, {
      cache: 'no-store',
    });
    if (response.ok) {
      markets = await response.json();
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch markets:', error);
  }
  
  // Limit to first 1000 markets for sitemap
  const limitedMarkets = markets.slice(0, 1000);

  const marketUrls = limitedMarkets
    .filter((market) => (market.shortCode || market.shortcode) && market.slug)
    .map((market) => ({
      url: absUrl(buildMarketUrl((market.shortCode || market.shortcode)!, market.slug!)),
      lastModified: new Date(market.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  return [
    {
      url: absUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absUrl("/home"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...marketUrls,
  ];
}
