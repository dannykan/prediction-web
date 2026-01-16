/**
 * Market type definitions
 */

export enum MarketMechanism {
  LMSR_V2 = 'LMSR_V2',
}

export interface Market {
  id: string;
  shortcode: string;
  code?: string; // Alias for shortcode
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  yesPercentage: number;
  noPercentage: number;
  totalVolume: number;
  tags: string[];
  createdAt?: string;
  updatedAt: string;
  // Extended fields for new design
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  optionsCount?: number;
  options?: Array<{
    id: string;
    name: string;
  }>;
  participantsCount?: number;
  category?: {
    id: string;
    name: string;
    iconUrl?: string | null;
  } | null;
  creator?: {
    id: string;
    displayName: string;
    name?: string;
    username?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
  } | null;
  creatorId?: string;
  isOfficial?: boolean;
  status?: string;
  closeTime?: string;
  resolutionRules?: string | null;
  mechanism?: MarketMechanism;
  // Statistics fields
  tradeCount?: number;
  usersWithPositions?: number;
  commentsCount?: number;
  // Probability for YES_NO markets (from backend)
  yesProbability?: number | null; // YES probability in percentage (0-100), null if not available
}
