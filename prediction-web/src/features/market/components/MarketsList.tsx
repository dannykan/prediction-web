import type { Market } from "../types/market";
import { MarketCard } from "./MarketCard";

interface MarketsListProps {
  markets: Market[];
}

export function MarketsList({ markets }: MarketsListProps) {
  if (markets.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">目前沒有可用的市場</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard key={market.shortcode} market={market} />
      ))}
    </div>
  );
}


