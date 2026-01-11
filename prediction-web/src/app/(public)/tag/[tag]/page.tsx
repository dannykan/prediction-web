import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarkets } from "@/features/market/api/getMarkets";
import { PageLayout } from "@/shared/components/layouts/PageLayout";
import Link from "next/link";

export const revalidate = 60;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `標籤: ${decodeURIComponent(tag)} - 神預測 Prediction God`,
    description: `瀏覽標籤為「${decodeURIComponent(tag)}」的市場`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  // Fetch markets with this tag
  const markets = await getMarkets({ status: "OPEN" });
  const filteredMarkets = markets.filter(market => 
    market.tags.some(t => t.toLowerCase() === decodedTag.toLowerCase())
  );

  if (filteredMarkets.length === 0) {
    return (
      <PageLayout>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">標籤: {decodedTag}</h1>
        <p className="text-base md:text-lg text-gray-600">目前沒有標籤為「{decodedTag}」的市場</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">標籤: {decodedTag}</h1>
      
      <div className="space-y-3 md:space-y-4">
        {filteredMarkets.map((market) => (
          <div key={market.id} className="border p-3 md:p-4 rounded bg-white dark:bg-gray-800">
            <Link href={`/m/${market.shortcode}-${market.slug}`} className="hover:underline">
              <h2 className="font-bold text-base md:text-lg">{market.title}</h2>
            </Link>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{market.description}</p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>代碼: {market.shortcode}</span>
              {market.updatedAt && (
                <span className="ml-4">更新: {new Date(market.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

