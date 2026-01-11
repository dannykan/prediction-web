import Image from "next/image";
import type { LeaderboardEntry } from "../types/leaderboard";

interface AvatarProps {
  entry: LeaderboardEntry;
  isLoserBoard: boolean;
  rank: number;
}

export function Avatar({ entry, isLoserBoard, rank }: AvatarProps) {
  const avatarUrl = entry.avatarUrl;

  return (
    <div
      className={`w-10 h-10 rounded-full border-2 flex-shrink-0 overflow-hidden ${
        isLoserBoard
          ? "bg-[#282828]/80 border-[#505050]/60"
          : rank <= 3
            ? "bg-gradient-to-br from-[#00FFFF]/20 to-[#FF8C00]/20 border-[#FFD700]/60 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
            : "border-[#6B7494]/40"
      }`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={entry.displayName || "User"}
          width={40}
          height={40}
          className={`w-full h-full object-cover ${
            isLoserBoard ? "grayscale" : ""
          }`}
          onError={(e) => {
            // Fallback to default avatar
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`w-full h-full flex items-center justify-center ${
          avatarUrl ? "hidden" : "flex"
        } ${isLoserBoard ? "bg-[#282828]/80" : "bg-[#2A3441]"}`}
      >
        <span className="text-white text-xs">👤</span>
      </div>
    </div>
  );
}



