/**
 * Leaderboard Types
 */

export type LeaderboardType = "gods" | "whales" | "losers";
export type LeaderboardTimeframe = "season" | "alltime";

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  rank?: number;
  level?: number;
  levelTitle?: string | null;
  coinBalance?: number;
  totalWinnings?: number;
  totalLosses?: number;
  pnl?: number; // Net profit/loss
  loss?: number; // Loss amount (for losers board)
  profitRate?: number | null; // Profit rate percentage (for gods board)
  winRate?: number | null; // Win rate percentage
  trend?: "up" | "down" | "same" | null; // Rank trend
  trendChange?: number | null; // Rank change amount
}

export interface SeasonInfo {
  code: string; // e.g., "S1"
  name: string; // e.g., "第 1 季：2026年1月"
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  timeLeft?: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank?: LeaderboardEntry | null;
  currentSeason?: SeasonInfo;
  total?: number;
  limit?: number;
}


