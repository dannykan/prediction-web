import type { Metadata } from "next";
import { getHomeData } from "@/features/market/api/getHomeData";
import { absUrl } from "@/shared/utils/seo";
import type { Market } from "@/features/market/types/market";
import type { Category } from "@/features/market/api/getCategories";
import { HomePageUIClient } from "@/components/figma/HomePageUIClient";
import { buildMarketUrl } from "@/features/market/utils/marketUrl";

// ISR: Revalidate every 60 seconds for fresh data
export const revalidate = 60;

// Generate static params for common categories (optional optimization)
// This helps pre-render common category pages
export async function generateStaticParams() {
  // Return empty array to use dynamic rendering
  // Can be enhanced later to pre-render popular categories
  return [];
}

/**
 * Generate structured data (JSON-LD) for SEO
 * Enhanced with more markets (50 instead of 10) and additional SEO fields
 */
function generateStructuredData(markets: Market[], categoryName?: string, searchQuery?: string) {
  // Generate description based on context
  let description = "瀏覽所有可用的預測市場，參與預測並贏得獎勵";
  if (categoryName && categoryName !== '全部') {
    description = `瀏覽 ${categoryName} 分類的所有預測市場，參與預測並贏得獎勵`;
  } else if (searchQuery) {
    description = `搜尋「${searchQuery}」相關的預測市場，參與預測並贏得獎勵`;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName && categoryName !== '全部' 
      ? `${categoryName} 預測市場列表`
      : searchQuery 
        ? `搜尋「${searchQuery}」的預測市場`
        : "預測市場列表",
    description,
    numberOfItems: markets.length,
    // Increased from 10 to 50 markets for better SEO coverage
    itemListElement: markets.slice(0, 50).map((market, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Question",
        name: market.title,
        description: market.description,
        url: absUrl(buildMarketUrl(market.shortcode, market.slug)),
        // Add keywords from category and tags
        ...(market.category?.name && {
          category: market.category.name,
        }),
        // Add image for better rich snippets
        ...(market.imageUrl && {
          image: market.imageUrl.startsWith("http")
            ? market.imageUrl
            : absUrl(market.imageUrl),
        }),
        dateCreated: market.createdAt,
        dateModified: market.updatedAt,
        // Add additional SEO metadata
        ...(market.closeTime && {
          datePublished: market.createdAt,
          dateModified: market.updatedAt,
        }),
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

// Generate dynamic metadata based on search params
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams instanceof Promise 
    ? await searchParams 
    : (searchParams || {});
  
  // Fetch categories to get category name
  const homeData = await getHomeData({
    filter: 'all',
    search: resolvedSearchParams.search,
    categoryId: resolvedSearchParams.categoryId,
  }, 60);
  
  const categories = homeData.categories;
  const categoryIdToName = new Map(categories.map(cat => [cat.id, cat.name]));
  
  let title = "首頁 - 神預測 Prediction God";
  let description = "瀏覽所有可用的預測市場，參與預測並贏得獎勵";
  
  if (resolvedSearchParams.categoryId) {
    const categoryName = categoryIdToName.get(resolvedSearchParams.categoryId);
    if (categoryName) {
      title = `${categoryName} 預測市場 - 神預測 Prediction God`;
      description = `瀏覽 ${categoryName} 分類的所有預測市場，參與預測並贏得獎勵`;
    }
  } else if (resolvedSearchParams.search) {
    title = `搜尋「${resolvedSearchParams.search}」- 神預測 Prediction God`;
    description = `搜尋「${resolvedSearchParams.search}」相關的預測市場，參與預測並贏得獎勵`;
  }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
      title,
      description,
      images: [absUrl("/images/logo.png")],
    },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Handle both Promise and sync searchParams (Next.js 14/15 compatibility)
  const resolvedSearchParams = searchParams instanceof Promise 
    ? await searchParams 
    : (searchParams || {});
  
  const filter = (resolvedSearchParams.filter || "all") as 'all' | 'latest' | 'closingSoon' | 'followed' | 'myBets';
  
  // Fetch all home page data using aggregated API
  const homeData = await getHomeData({
    filter,
    search: resolvedSearchParams.search,
    categoryId: resolvedSearchParams.categoryId,
  }, 60);
  
  // Extract data from aggregated response
  const markets = homeData.markets;
  const categories = homeData.categories;
  const userStatistics = homeData.userStatistics;
  const quests = homeData.quests;
  const followedMarkets = homeData.followedMarkets;
  
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
  
  // Generate structured data with context
  const structuredData = generateStructuredData(
    markets, 
    selectedCategoryName, 
    resolvedSearchParams.search
  );
  
  // Use commentsCount from backend API response (more efficient than calling API for each market)
  const commentsCountMap = new Map(
    markets.map((market) => [market.id, market.commentsCount || 0]),
  );

  // Get API base URL for preconnect (use environment variable directly)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  return (
    <>
      {/* Resource Hints for Performance */}
      {apiBaseUrl && (
        <>
          <link rel="preconnect" href={apiBaseUrl} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={apiBaseUrl} />
        </>
      )}
      
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
        initialUser={homeData.user}
        initialUserStatistics={homeData.userStatistics}
        initialQuests={homeData.quests}
        initialUnreadNotificationsCount={homeData.unreadNotificationsCount}
      />
    </>
  );
}

