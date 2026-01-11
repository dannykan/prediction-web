/**
 * Bet Types
 * Based on backend Bet entity
 */

export type BetSide = "YES" | "NO";
export type BetStatus = "PENDING" | "WON" | "LOST" | "REFUNDED";

export interface Bet {
  id: string;
  selectionId: string;
  side: BetSide;
  stakeAmount: number;
  grossStakeAmount?: number;
  platformFee: number;
  netStakeAmount?: number;
  potentialWin: number;
  status: BetStatus;
  userId: string;
  marketId: string;
  appliedEffects?: Array<Record<string, any>>;
  createdAt: string;
  updatedAt: string;
  // Extended fields (may be populated by backend)
  marketTitle?: string;
  market?: {
    id: string;
    title: string;
    shortcode: string;
    slug: string;
  };
}



