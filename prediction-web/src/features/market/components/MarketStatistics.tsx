"use client";

import { useEffect, useState } from "react";
import { clientFetch } from "@/core/api/client";

interface MarketStatisticsProps {
  marketId: string;
  initialTradeCount?: number;
  initialUsersWithPositions?: number;
  initialCommentsCount?: number;
  initialTotalVolume?: number;
}

interface MarketStats {
  tradeCount: number;
  usersWithPositions: number;
  commentsCount: number;
  totalVolume: number;
}

/**
 * Client component to display and update market statistics in real-time
 * 客戶端組件，用於實時顯示和更新市場統計數據
 */
export function MarketStatistics({
  marketId,
  initialTradeCount = 0,
  initialUsersWithPositions = 0,
  initialCommentsCount = 0,
  initialTotalVolume = 0,
}: MarketStatisticsProps) {
  const [stats, setStats] = useState<MarketStats>({
    tradeCount: initialTradeCount,
    usersWithPositions: initialUsersWithPositions,
    commentsCount: initialCommentsCount,
    totalVolume: initialTotalVolume,
  });

  // On mount, fetch latest statistics
  useEffect(() => {
    const refreshStatistics = async () => {
      try {
        // Fetch market details by ID (the API endpoint accepts UUID)
        const response = await clientFetch(`/api/markets/${encodeURIComponent(marketId)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const marketData = await response.json();
          const newStats = {
            tradeCount: marketData.tradeCount ?? 0,
            usersWithPositions: marketData.usersWithPositions ?? 0,
            commentsCount: marketData.commentsCount ?? 0,
            totalVolume: marketData.totalVolume ?? 0,
          };
          setStats(newStats);
        }
      } catch (error) {
        console.warn("[MarketStatistics] Failed to refresh statistics:", error);
      }
    };

    // Fetch once on mount
    refreshStatistics();
  }, [marketId]);

  return (
    <>
      <div>
        <strong>交易紀錄:</strong> {stats.tradeCount.toLocaleString()} 筆
      </div>
      <div>
        <strong>持倉用戶:</strong> {stats.usersWithPositions.toLocaleString()} 人
      </div>
      <div>
        <strong>留言評論:</strong> {stats.commentsCount.toLocaleString()} 則
      </div>
      {stats.totalVolume !== undefined && (
        <div>
          <strong>交易量:</strong> {stats.totalVolume.toLocaleString()} G
        </div>
      )}
    </>
  );
}

