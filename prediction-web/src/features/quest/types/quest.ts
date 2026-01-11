/**
 * Quest Types
 * Based on backend quests response
 */

export interface QuestDay {
  day: number;
  baseAmount: number;
  completed: boolean;
  canClaim: boolean;
}

export interface DailyQuest {
  id: number;
  icon: string;
  title: string;
  description: string;
  type: string;
  days?: QuestDay[];
  canClaim?: boolean;
  progress?: number;
  total?: number;
}

export interface WeeklyQuest {
  id: number;
  icon: string;
  title: string;
  description: string;
  type: string;
  reward: number;
  total?: number;
  canClaim: boolean;
  progress?: number;
}

export interface QuestsResponse {
  dailyQuests: DailyQuest[];
  weeklyQuests: WeeklyQuest[];
}



