/**
 * Market Image Component for Server Components
 * Optimized for SEO with proper alt text and structured data
 */

import Image from "next/image";
import type { Market } from "../types/market";

interface MarketImageProps {
  market: Market;
  priority?: boolean;
  className?: string;
}

export function MarketImage({ market, priority = false, className = "" }: MarketImageProps) {
  if (!market.imageUrl) {
    return (
      <div
        className={`relative bg-gray-200 flex items-center justify-center ${className}`}
        style={{ minHeight: "192px" }}
        aria-label={`${market.title} - 無圖片`}
      >
        <span className="text-4xl" aria-hidden="true">
          📊
        </span>
      </div>
    );
  }

  // Check if className contains height constraints (for detail page)
  const hasHeightConstraint = className.includes('h-');
  const containerClassName = hasHeightConstraint
    ? `relative ${className}`
    : `relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 ${className}`;

  return (
    <div className={containerClassName}>
      <Image
        src={market.imageUrl}
        alt={`${market.title} - 預測市場圖片`}
        fill
        sizes={hasHeightConstraint ? "(max-width: 768px) 100vw, 1024px" : "(max-width: 768px) 100vw, 256px"}
        className="object-cover"
        itemProp="image"
        priority={priority}
        // Next.js Image component handles errors gracefully
        // If image fails, it will show a broken image icon
        // We can add a fallback using unoptimized if needed
      />
    </div>
  );
}

