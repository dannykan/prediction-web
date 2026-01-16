import type { Metadata } from "next";
import { getMarkets } from "@/features/market/api/getMarkets";
import { getCategories } from "@/features/market/api/getCategories";
import { absUrl } from "@/shared/utils/seo";
import type { Market } from "@/features/market/types/market";
import type { Category } from "@/features/market/api/getCategories";
import { HomePageUIClient } from "@/components/figma/HomePageUIClient";
import { getMeServer } from "@/features/user/api/getMeServer";
import { getUserStatisticsServer } from "@/features/user/api/getUserStatisticsServer";
import { getQuestsServer } from "@/features/quest/api/getQuestsServer";
import { buildMarketUrl } from "@/features/market/utils/marketUrl";
import { getFollowedMarkets } from "@/features/market/api/getFollowedMarkets";
import { getAllUserPositionsServer } from "@/features/user/api/getAllUserPositionsServer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "首頁 - 神預測 Prediction God",
  description: "瀏覽所有可用的預測市場，參與預測並贏得獎勵",
  openGraph: {
    title: "首頁 - 神預測 Prediction God",
    description: "瀏覽所有可用的預測市場，參與預測並贏得獎勵",
    url: absUrl("/home"),
    siteName: "神預測 Prediction God",
    images: [
      {
        url: absUrl("/images/logo.png"),
        width: 1200,
        height: 630,
        alt: "神預測 Prediction God",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "首頁 - 神預測 Prediction God",
    description: "瀏覽所有可用的預測市場，參與預測並贏得獎勵",
    images: [absUrl("/images/logo.png")],
  },
};

/**
 * Generate structured data (JSON-LD) for SEO
 */
function generateStructuredData(markets: Market[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "預測市場列表",
    description: "瀏覽所有可用的預測市場，參與預測並贏得獎勵",
    numberOfItems: markets.length,
    itemListElement: markets.slice(0, 10).map((market, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Question",
        name: market.title,
        description: market.description,
        url: absUrl(buildMarketUrl(market.shortcode, market.slug)),
        ...(market.imageUrl && {
          image: market.imageUrl.startsWith("http")
            ? market.imageUrl
            : absUrl(market.imageUrl),
        }),
        dateCreated: market.createdAt,
        dateModified: market.updatedAt,
      },
    })),
  };
}

interface HomePageProps {
  searchParams?: Promise<{
    search?: string;
    categoryId?: string;
    filter?: string;
  }> | {
    search?: string;
    categoryId?: string;
    filter?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Handle both Promise and sync searchParams (Next.js 14/15 compatibility)
  const resolvedSearchParams = searchParams instanceof Promise 
    ? await searchParams 
    : (searchParams || {});
  
  const filter = resolvedSearchParams.filter || "all";
  
  // Try to get current user (for authenticated features and followed filter)
  const currentUser = await getMeServer();
  
  // Fetch markets based on filter
  let markets: Market[] = [];
  
  if (filter === "followed" && currentUser) {
    // Fetch followed markets
    try {
      markets = await getFollowedMarkets(currentUser.id);
    } catch (error) {
      console.error("[HomePage] Failed to fetch followed markets:", error);
      markets = [];
    }
  } else if (filter === "myBets" && currentUser) {
    // Fetch markets where user has positions (已下注)
    try {
      const positions = await getAllUserPositionsServer(currentUser.id);
      const marketIds = Array.from(new Set(positions.map(p => p.marketId)));
      
      if (marketIds.length > 0) {
        // Fetch markets for each position
        const allMarkets = await getMarkets({ 
          status: "OPEN",
          search: resolvedSearchParams.search,
          categoryId: resolvedSearchParams.categoryId,
        });
        
        // Filter to only markets where user has positions
        markets = allMarkets.filter(market => marketIds.includes(market.id));
        
        // Sort by last trade time (most recent first)
        markets = markets.sort((a, b) => {
          const posA = positions.find(p => p.marketId === a.id);
          const posB = positions.find(p => p.marketId === b.id);
          if (!posA || !posB) return 0;
          const dateA = new Date(posA.lastTradeAt).getTime();
          const dateB = new Date(posB.lastTradeAt).getTime();
          return dateB - dateA;
        });
      } else {
        markets = [];
      }
    } catch (error) {
      console.error("[HomePage] Failed to fetch markets with positions:", error);
      markets = [];
    }
  } else {
    // Fetch all markets with search and category filters
    markets = await getMarkets({ 
      status: "OPEN",
      search: resolvedSearchParams.search,
      categoryId: resolvedSearchParams.categoryId,
    });
    
    // Apply client-side filtering and sorting
    if (filter === "all") {
      // Sort by total volume (highest first) - 熱門
      markets = markets.sort((a, b) => {
        const volumeA = a.totalVolume || 0;
        const volumeB = b.totalVolume || 0;
        return volumeB - volumeA;
      });
    } else if (filter === "latest") {
      // Sort by created date (newest first) - 最新
      markets = markets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (filter === "closingSoon") {
      // Filter and sort by closing time (soonest first)
      markets = markets
        .filter(market => market.closeTime && new Date(market.closeTime) > new Date())
        .sort((a, b) => {
          const dateA = a.closeTime ? new Date(a.closeTime).getTime() : Infinity;
          const dateB = b.closeTime ? new Date(b.closeTime).getTime() : Infinity;
          return dateA - dateB;
        });
    }
  }
  
  const structuredData = generateStructuredData(markets);
  
  // Fetch user-related data if authenticated
  let userStatistics = null;
  let quests = null;
  // let myBets: any[] = []; // Removed - Bet API deprecated, using LMSR now
  let followedMarkets: Market[] = [];
  
  if (currentUser) {
    try {
      const results = await Promise.allSettled([
        getUserStatisticsServer(currentUser.id),
        getQuestsServer(currentUser.id),
        // getMyBetsServer(currentUser.id), // Removed - Bet API deprecated, using LMSR now
        getFollowedMarkets(currentUser.id),
      ]);
      
      userStatistics = results[0]?.status === "fulfilled" ? results[0].value : null;
      quests = results[1]?.status === "fulfilled" ? results[1].value : null;
      // myBets = results[2]?.status === "fulfilled" ? results[2].value : []; // Removed - Bet API deprecated, using LMSR now
      followedMarkets = results[2]?.status === "fulfilled" ? results[2].value : [];
      
      // Log errors for debugging
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const apiNames = ["getUserStatisticsServer", "getQuestsServer", "getFollowedMarkets"]; // Removed "getMyBetsServer"
          console.error(`[HomePage] Failed to fetch ${apiNames[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error("[HomePage] Failed to fetch user data:", error);
      // Continue without user data
    }
  }

  // Use commentsCount from backend API response (more efficient than calling API for each market)
  const commentsCountMap = new Map(
    markets.map((market) => [market.id, market.commentsCount || 0]),
  );

  // Fetch categories from database
  const categories = await getCategories(60);
  
  // Map category ID to name for display
  const categoryIdToName = new Map(categories.map(cat => [cat.id, cat.name]));
  
  // If categoryId is provided, find the category name for display
  let selectedCategoryName = '全部';
  if (resolvedSearchParams.categoryId) {
    const categoryName = categoryIdToName.get(resolvedSearchParams.categoryId);
    if (categoryName) {
      selectedCategoryName = categoryName;
    }
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Figma UI HomePage */}
      <HomePageUIClient
        initialMarkets={markets}
        initialCategories={categories}
        commentsCountMap={commentsCountMap}
        initialSearch={resolvedSearchParams.search}
        initialCategoryId={resolvedSearchParams.categoryId}
        initialCategoryName={selectedCategoryName}
        initialFilter={filter}
      />
    </>
  );
}

