import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Market } from "../types/market";
import { formatPercentage, formatVolume } from "@/shared/utils/format";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const marketUrl = `/m/${market.shortcode}-${market.slug}`;

  return (
    <Link href={marketUrl} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="line-clamp-2">{market.title}</CardTitle>
          <CardDescription className="line-clamp-2">{market.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Yes</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(market.yesPercentage)}
                </div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-sm text-muted-foreground">No</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatPercentage(market.noPercentage)}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">總交易量</div>
              <div className="text-lg font-semibold">{formatVolume(market.totalVolume)}</div>
            </div>
            {market.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {market.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-secondary rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


