import type { LeaderboardEntry } from "../types/leaderboard";

interface RankBadgeProps {
  rank: number;
  isLoserBoard: boolean;
  size?: "sm" | "lg";
}

export function RankBadge({ rank, isLoserBoard, size = "sm" }: RankBadgeProps) {
  const badgeSize = size === "lg" ? "w-9 h-9" : "w-8 h-8";
  const textSize = size === "lg" ? "text-sm" : "text-xs";

  if (isLoserBoard) {
    return (
      <div
        className={`${badgeSize} rounded-lg flex items-center justify-center bg-[#3C3C3C]/60 border-2 border-[#646464]/40`}
      >
        <span className={`${textSize} font-black text-[#808080]`}>{rank}</span>
      </div>
    );
  }

  // Gods/Whales board rank badge
  let gradientFrom: string | null = null;
  let gradientTo: string | null = null;
  let textColor: string;
  let shadowStyle: React.CSSProperties = {};
  let backgroundColor: string | null = null;

  if (rank === 1) {
    gradientFrom = "#FFD700";
    gradientTo = "#FFA500";
    textColor = "text-black";
    shadowStyle = { boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)" };
  } else if (rank === 2) {
    gradientFrom = "#C0C0C0";
    gradientTo = "#A8A8A8";
    textColor = "text-black";
    shadowStyle = { boxShadow: "0 0 16px rgba(192, 192, 192, 0.25)" };
  } else if (rank === 3) {
    gradientFrom = "#CD7F32";
    gradientTo = "#B8732D";
    textColor = "text-white";
    shadowStyle = { boxShadow: "0 0 16px rgba(205, 127, 50, 0.25)" };
  } else {
    backgroundColor = "rgba(107, 116, 148, 0.2)";
    textColor = "text-[#B0B8D4]";
  }

  const borderColor =
    rank === 1 ? "rgba(255, 215, 0, 0.6)" : rank === 2 ? "rgba(192, 192, 192, 0.6)" : rank === 3 ? "rgba(205, 127, 50, 0.6)" : "rgba(107, 116, 148, 0.4)";

  const backgroundStyle: React.CSSProperties = gradientFrom && gradientTo
    ? {
        background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
        ...shadowStyle,
      }
    : backgroundColor
      ? { backgroundColor, ...shadowStyle }
      : shadowStyle;

  return (
    <div
      className={`${badgeSize} rounded-lg flex items-center justify-center border-2`}
      style={{
        ...backgroundStyle,
        borderColor,
      }}
    >
      <span className={`${textSize} font-black ${textColor}`}>{rank}</span>
    </div>
  );
}

