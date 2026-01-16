import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getMarketByShortcode } from "@/features/market/api/getMarketByShortcode";
import { parseMarketId } from "@/features/market/api/parseMarketId";
import { MarketDetailUIClient } from "@/components/figma/MarketDetailUIClient";
import { absUrl } from "@/shared/utils/seo";
import { truncateText } from "@/shared/utils/format";
import { getCommentsCount } from "@/features/comment/api/getCommentsCount";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";
import { buildMarketUrl } from "@/features/market/utils/marketUrl";
import type { Market } from "@/features/market/types/market";

/**
 * Generate breadcrumb structured data (JSON-LD) for SEO
 */
function generateBreadcrumbStructuredData(market: Market) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: absUrl("/home"),
      },
      ...(market.category ? [
        {
          "@type": "ListItem",
          position: 2,
          name: market.category.name,
          item: absUrl(`/home?categoryId=${market.category.id}`),
        },
      ] : []),
      {
        "@type": "ListItem",
        position: market.category ? 3 : 2,
        name: market.title,
        item: absUrl(buildMarketUrl(market.shortcode, market.slug)),
      },
    ],
  };
}

export const revalidate = 60;

interface MarketPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { id } = await params;
  const { shortcode } = parseMarketId(id);
  const market = await getMarketByShortcode(shortcode);

  if (!market) {
    return {
      title: "市場不存在 - 神預測 Prediction God",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = absUrl(buildMarketUrl(market.shortcode, market.slug));
  const description = truncateText(market.description, 160);

  // 使用市場自己的配圖，如果沒有則使用默認圖片
  // 處理圖片 URL：如果是完整 URL 直接使用，如果是相對 URL 則添加 API base URL
  const getOgImageUrl = (): string => {
    if (!market.imageUrl) {
      // 使用 logo 作為默認圖片
      return absUrl("/images/logo.png");
    }
    
    // 如果已經是完整的 HTTP/HTTPS URL，直接使用
    if (market.imageUrl.startsWith('http://') || market.imageUrl.startsWith('https://')) {
      return market.imageUrl;
    }
    
    // 如果是相對 URL，需要添加 API base URL（因為圖片存儲在後端）
    try {
      const apiBaseUrl = getApiBaseUrl();
      // 確保 URL 以 / 開頭
      const imagePath = market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`;
      // 確保 API base URL 不以 / 結尾
      const cleanApiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      return `${cleanApiBaseUrl}${imagePath}`;
    } catch (error) {
      // 如果無法獲取 API base URL，記錄錯誤並使用 site URL（可能不正確，但至少不會出錯）
      console.error('[generateMetadata] Failed to get API base URL:', error);
      return absUrl(market.imageUrl.startsWith('/') ? market.imageUrl : `/${market.imageUrl}`);
    }
  };
  
  const ogImageUrl = getOgImageUrl();
  
  // 確保 URL 是絕對路徑，Facebook 需要完整的 URL
  const absoluteUrl = canonicalUrl;
  
  // Debug: 在開發環境中記錄圖片 URL
  if (process.env.NODE_ENV === 'development') {
    console.log('[generateMetadata] Market OG Image URL:', {
      marketId: market.id,
      imageUrl: market.imageUrl,
      ogImageUrl,
      canonicalUrl: absoluteUrl,
    });
  }

  return {
    title: `${market.title} - 神預測 Prediction God`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: market.title,
      description,
      url: absoluteUrl,
      siteName: "神預測 Prediction God",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: market.title,
        },
      ],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: market.title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function MarketPage({ params, searchParams }: MarketPageProps) {
  const { id } = await params;
  const { shortcode, slugFromUrl } = parseMarketId(id);
  const resolvedSearchParams = await searchParams;
  const commentId = resolvedSearchParams.comment as string | undefined;

  // Get market by shortcode (slug is not used for lookup)
  const market = await getMarketByShortcode(shortcode);

  if (!market) {
    notFound();
  }

  // Debug logging for slug comparison
  if (process.env.NODE_ENV === 'development') {
    console.log('[MarketPage] Slug comparison:', {
      idFromUrl: id,
      shortcode,
      slugFromUrl,
      marketSlug: market.slug,
      match: slugFromUrl === market.slug,
    });
  }

  // Check if slug matches canonical slug
  // If not, redirect to canonical URL
  // Note: We allow slug mismatch to avoid redirect loops, but log it for debugging
  if (slugFromUrl !== null && slugFromUrl !== market.slug) {
    // Only redirect if slugs are significantly different (not just encoding differences)
    // This prevents redirect loops while still canonicalizing URLs
    const normalizedSlugFromUrl = slugFromUrl.trim().replace(/\s+/g, "-");
    const normalizedMarketSlug = market.slug.trim().replace(/\s+/g, "-");
    
    if (normalizedSlugFromUrl !== normalizedMarketSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[MarketPage] Slug mismatch detected, redirecting to canonical URL:', {
          from: slugFromUrl,
          to: market.slug,
          normalizedFrom: normalizedSlugFromUrl,
          normalizedTo: normalizedMarketSlug,
        });
      }
      // Redirect to canonical URL (Next.js Link/router will handle encoding automatically)
      redirect(buildMarketUrl(market.shortcode, market.slug, commentId ? { comment: commentId } : undefined));
    } else {
      // Slugs are the same after normalization, no redirect needed
      if (process.env.NODE_ENV === 'development') {
        console.log('[MarketPage] Slugs match after normalization, no redirect needed');
      }
    }
  }

  // Get comments count (Server-side)
  let commentsCount = 0;
  try {
    commentsCount = await getCommentsCount(market.id);
  } catch (error) {
    console.error(`[MarketPage] Failed to fetch comments count for market ${market.id}:`, error);
    commentsCount = 0;
  }

  // Generate breadcrumb structured data for SEO
  const breadcrumbData = generateBreadcrumbStructuredData(market);

  // Get API base URL for preconnect
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const marketImageUrl = market.imageUrl;

  return (
    <>
      {/* Resource Hints for Performance */}
      {apiBaseUrl && (
        <>
          <link rel="preconnect" href={apiBaseUrl} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={apiBaseUrl} />
        </>
      )}
      
      {/* Preload market image if available */}
      {marketImageUrl && (
        <link
          rel="preload"
          href={marketImageUrl.startsWith('http') ? marketImageUrl : `${apiBaseUrl}${marketImageUrl.startsWith('/') ? marketImageUrl : `/${marketImageUrl}`}`}
          as="image"
        />
      )}
      
      {/* Breadcrumb Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <MarketDetailUIClient
        market={market}
        commentId={commentId}
        initialCommentsCount={commentsCount}
      />
    </>
  );
}
