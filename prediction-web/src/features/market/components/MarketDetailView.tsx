import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Market } from "../types/market";
import { formatPercentage, formatVolume } from "@/shared/utils/format";

interface MarketDetailViewProps {
  market: Market;
}

export function MarketDetailView({ market }: MarketDetailViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{market.title}</CardTitle>
          <CardDescription className="text-base mt-2">{market.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Yes</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatPercentage(market.yesPercentage)}
                </div>
              </div>
              <div className="text-center p-6 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">No</div>
                <div className="text-4xl font-bold text-red-600">
                  {formatPercentage(market.noPercentage)}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="text-sm text-muted-foreground mb-2">總交易量</div>
              <div className="text-3xl font-bold">{formatVolume(market.totalVolume)}</div>
            </div>

            {market.tags.length > 0 && (
              <div className="pt-6 border-t">
                <div className="text-sm text-muted-foreground mb-3">標籤</div>
                <div className="flex flex-wrap gap-2">
                  {market.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-secondary rounded-md text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {market.imageUrl && (
              <div className="pt-6 border-t">
                <img
                  src={market.imageUrl}
                  alt={market.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


