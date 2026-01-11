export interface DayReward {
  day: string; // "Day 1", "Day 2", etc.
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Quest {
  id: number;
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  claimed?: boolean;
  days?: DayReward[];
  isCompleted?: boolean; // For weekly quests
}

export interface QuestsResponse {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  canClaimCompletionBonus: boolean;
  completionBonusClaimed: boolean;
  completionBonusReward: number;
  totalQuests: number;
  completedQuests: number;
}

export interface ClaimRewardResponse {
  success: boolean;
  rewardAmount: number;
  claimed: boolean;
  questId?: number;
  dayIndex?: number;
}
