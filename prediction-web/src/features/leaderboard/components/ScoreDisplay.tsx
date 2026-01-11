import type { LeaderboardEntry, LeaderboardType } from "../types/leaderboard";

interface ScoreDisplayProps {
  entry: LeaderboardEntry;
  rank: number;
  leaderboardType: LeaderboardType;
  isLoserBoard: boolean;
  isFixedCard?: boolean;
}

export function ScoreDisplay({
  entry,
  rank,
  leaderboardType,
  isLoserBoard,
  isFixedCard = false,
}: ScoreDisplayProps) {
  const textSize = isFixedCard ? "text-base" : "text-lg";

  if (leaderboardType === "gods") {
    // Gods board: Profit rate percentage
    const profitRate = entry.profitRate;

    if (profitRate === null || profitRate === undefined) {
      return (
        <span className={`${textSize} font-black text-[#6B7494]`}>N/A</span>
      );
    }

    if (profitRate < 0) {
      return (
        <span className={`${textSize} font-black text-[#EF4444]`}>
          {profitRate.toFixed(1)}%
        </span>
      );
    }

    // Positive profit rate with gradient
    let gradientFrom: string;
    let gradientTo: string;
    if (rank === 1) {
      gradientFrom = "#FFD700";
      gradientTo = "#FFA500";
    } else if (rank === 2) {
      gradientFrom = "#C0C0C0";
      gradientTo = "#A8A8A8";
    } else if (rank === 3) {
      gradientFrom = "#CD7F32";
      gradientTo = "#B8732D";
    } else {
      gradientFrom = "#10B981";
      gradientTo = "#34D399";
    }

    return (
      <span
        className={`${textSize} font-black`}
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        +{profitRate.toFixed(1)}%
      </span>
    );
  } else if (leaderboardType === "whales") {
    // Whales board: Profit amount
    const pnl = entry.pnl || 0;

    if (pnl < 0) {
      return (
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            <span className="text-xs">💰</span>
            <span className="text-xs text-[#6B7494]">盈利</span>
          </div>
          <span className={`${textSize} font-black text-[#EF4444]`}>
            {formatNumber(pnl)}
          </span>
        </div>
      );
    }

    const gradientFrom = rank <= 3 ? "#00F0FF" : "#00FFFF";
    const gradientTo = "#FF8C00";

    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 mb-1">
          <span className="text-xs">💰</span>
          <span className="text-xs text-[#6B7494]">盈利</span>
        </div>
        <span
          className={`${textSize} font-black`}
          style={{
            backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          +{formatNumber(pnl)}
        </span>
      </div>
    );
  } else {
    // Losers board: Loss amount
    const loss = entry.loss || entry.totalLosses || 0;

    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 mb-1">
          <span className="text-xs">💰</span>
          <span className="text-xs text-[#606060]">虧損</span>
        </div>
        <span className={`${textSize} font-black text-[#EF4444]`}>
          -{formatNumber(loss)}
        </span>
      </div>
    );
  }
}

function formatNumber(num: number): string {
  return Math.abs(num)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

