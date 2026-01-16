import type { MetadataRoute } from "next";
import { getMarkets } from "@/features/market/api/getMarkets";
import { absUrl } from "@/shared/utils/seo";
import { buildMarketUrl } from "@/features/market/utils/marketUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Limit to first 1000 markets for sitemap
  const markets = await getMarkets(undefined, 3600); // Revalidate every hour for sitemap
  const limitedMarkets = markets.slice(0, 1000);

  const marketUrls = limitedMarkets.map((market) => ({
    url: absUrl(buildMarketUrl(market.shortcode, market.slug)),
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
