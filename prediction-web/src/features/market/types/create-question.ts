/**
 * Types for create question flow
 */

export type QuestionType = "binary" | "single" | "multiple";

export type CreationStep = "type" | "basicInfo" | "tierSelection" | "prediction" | "confirm";

export interface Answer {
  id: number;
  text: string;
}

export interface TierConfig {
  value: number;
  emoji: string;
  name: string;
  commissionRate: number; // Percentage, e.g., 1.5 means 1.5%
  breakEvenVolume: number;
  highlight?: string;
  stats?: string;
}

export const TIER_CONFIGS: TierConfig[] = [
  {
    value: 1000,
    emoji: "🌱",
    name: "新手級",
    commissionRate: 1.5,
    breakEvenVolume: 3667,
  },
  {
    value: 5000,
    emoji: "🥉",
    name: "銅牌級",
    commissionRate: 2,
    breakEvenVolume: 12750,
    stats: "📊 70% 創建者成功回本",
  },
  {
    value: 30000,
    emoji: "🥈",
    name: "銀牌級",
    commissionRate: 3,
    breakEvenVolume: 55000,
    highlight: "⭐ 推薦",
    stats: "🔥 平均 ROI: 50-150%",
  },
  {
    value: 150000,
    emoji: "🥇",
    name: "金牌級",
    commissionRate: 4,
    breakEvenVolume: 206250,
    stats: "🚀 爆款專用，高風險高回報",
  },
];



