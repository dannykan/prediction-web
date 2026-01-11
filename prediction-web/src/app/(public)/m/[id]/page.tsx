import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getMarketByShortcode } from "@/features/market/api/getMarketByShortcode";
import { parseMarketId } from "@/features/market/api/parseMarketId";
import { MarketDetailUIClient } from "@/components/figma/MarketDetailUIClient";
import { absUrl } from "@/shared/utils/seo";
import { truncateText } from "@/shared/utils/format";
import { getCommentsCount } from "@/features/comment/api/getCommentsCount";

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

  const canonicalUrl = absUrl(`/m/${market.shortcode}-${market.slug}`);
  const description = truncateText(market.description, 160);

  return {
    title: `${market.title} - 神預測 Prediction God`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: market.title,
      description,
      url: canonicalUrl,
      siteName: "神預測 Prediction God",
      images: [
        {
          url: absUrl("/og-default.png"),
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
      images: [absUrl("/og-default.png")],
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

  // Check if slug matches canonical slug
  // If not, redirect to canonical URL
  if (slugFromUrl !== null && slugFromUrl !== market.slug) {
    redirect(`/m/${market.shortcode}-${market.slug}${commentId ? `?comment=${commentId}` : ''}`);
  }

  // Get comments count (Server-side)
  let commentsCount = 0;
  try {
    commentsCount = await getCommentsCount(market.id);
  } catch (error) {
    console.error(`[MarketPage] Failed to fetch comments count for market ${market.id}:`, error);
    commentsCount = 0;
  }

  return (
    <MarketDetailUIClient
      market={market}
      commentId={commentId}
      initialCommentsCount={commentsCount}
    />
  );
}
