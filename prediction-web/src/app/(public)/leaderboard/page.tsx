import type { Metadata } from "next";
import { absUrl } from "@/shared/utils/seo";
import { getLeaderboard } from "@/features/leaderboard/api/getLeaderboard";
import { getMyRank } from "@/features/leaderboard/api/getMyRank";
import { getMeServer } from "@/features/user/api/getMeServer";
import { getSeasonCode, DEFAULT_SEASONS } from "@/features/leaderboard/utils/season";
import { LeaderboardUIClient } from "@/components/figma/LeaderboardUIClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "排行榜 - 神預測 Prediction God",
  description: "查看預測排行榜，包括神人榜、鯨魚榜和衰人榜",
  openGraph: {
    title: "排行榜 - 神預測 Prediction God",
    description: "查看預測排行榜，包括神人榜、鯨魚榜和衰人榜",
    url: absUrl("/leaderboard"),
    siteName: "神預測 Prediction God",
  },
};

export default async function LeaderboardPage() {
  // Get current user
  const currentUser = await getMeServer();
  const currentUserId = currentUser?.id;

  // Get default season
  const defaultSeason = DEFAULT_SEASONS[0]!;
  const seasonCode = getSeasonCode(defaultSeason.name);

  // Fetch leaderboard data
  let leaderboardData = {
    leaderboard: [] as any[],
    currentUserRank: null as any,
  };

  try {
    const [leaderboardResponse, myRank] = await Promise.all([
      getLeaderboard({
        type: "gods",
        timeframe: "season",
        season: seasonCode || undefined,
        limit: 50,
        userId: currentUserId || undefined,
      }),
      currentUserId
        ? getMyRank({
            type: "gods",
            timeframe: "season",
            season: seasonCode || undefined,
          })
        : Promise.resolve(null),
    ]);

    // Handle currentUserRank structure: it can be either { rank, entry: {...} } or direct entry object
    let userRank: any = myRank || leaderboardResponse.currentUserRank || null;
    if (userRank && userRank.entry) {
      // If it's the nested structure, extract the entry
      userRank = { ...userRank.entry, rank: userRank.rank };
    }
    
    leaderboardData = {
      leaderboard: leaderboardResponse.leaderboard || [],
      currentUserRank: userRank,
    };
  } catch (error) {
    console.error("[LeaderboardPage] Failed to fetch leaderboard:", error);
    // Continue with empty data
  }

  return (
    <LeaderboardUIClient
      initialData={leaderboardData}
      currentUserId={currentUserId || undefined}
    />
  );
}

