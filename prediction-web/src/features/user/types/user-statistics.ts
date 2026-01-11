/**
 * User Statistics Types
 * Based on backend UserStatisticsDto
 */

export interface UserStatistics {
  userId: string;
  statistics: {
    profitRate: {
      total: {
        profit: number;
        initialBalance: number;
        totalRewards: number;
        coinBalance: number;
        totalInvested: number;
        totalPending: number;
        totalAssets: number;
        rate: number;
      };
      season: {
        profit: number;
        seasonStartBalance: number;
        seasonRewards: number;
        seasonInvested: number;
        seasonPending: number;
        rate: number;
        seasonId: string;
        seasonStartDate: string;
      };
    };
  };
}



