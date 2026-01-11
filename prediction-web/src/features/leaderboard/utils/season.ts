/**
 * Season utilities
 */

export interface Season {
  code: string; // e.g., "S1"
  name: string; // e.g., "第 1 季：2025年12月"
  startDate: Date;
  endDate: Date;
}

/**
 * Get season end time
 * Rule: Each season ends at the last day of the month at 00:00:00 (i.e., the first day of next month)
 * Example: Season 1 (December 2025) ends at 2026-01-01 00:00:00
 */
export function getSeasonEndTime(seasonName: string): Date | null {
  try {
    // Extract year and month from season name
    // Format: "第 1 季：2025年12月"
    const match = seasonName.match(/(\d{4})年(\d{1,2})月/);
    if (!match) {
      return null;
    }

    const year = parseInt(match[1]!, 10);
    const month = parseInt(match[2]!, 10);

    // Calculate season end time: first day of next month at 00:00:00
    const endTime = new Date(year, month, 1, 0, 0, 0); // month is 0-indexed, so month+1 is next month
    return endTime;
  } catch (error) {
    console.error("Failed to calculate season end time:", error);
    return null;
  }
}

/**
 * Calculate time left until season ends
 */
export function getTimeLeft(seasonName: string): {
  days: number;
  hours: number;
  minutes: number;
} {
  const endTime = getSeasonEndTime(seasonName);
  if (!endTime) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const now = new Date();
  const difference = endTime.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * Get season code from season name
 * Example: "第 1 季：2025年12月" -> "S1"
 */
export function getSeasonCode(seasonName: string): string | null {
  const match = seasonName.match(/第 (\d+) 季/);
  if (!match) {
    return null;
  }
  const seasonNumber = match[1];
  return `S${seasonNumber}`;
}

/**
 * Calculate current season based on current date
 * Rule: S1 = 2026年1月, S2 = 2026年2月, etc.
 */
export function getCurrentSeason(): Season {
  const now = new Date();
  const baseYear = 2026;
  const baseMonth = 1; // January 2026
  
  // Calculate months since base month
  const yearDiff = now.getFullYear() - baseYear;
  const monthDiff = now.getMonth() + 1 - baseMonth; // getMonth() returns 0-11, so add 1
  const totalMonths = yearDiff * 12 + monthDiff;
  
  // Season number starts from 1
  const seasonNumber = Math.max(1, totalMonths);
  
  // Calculate season date range
  const targetYear = baseYear + Math.floor((baseMonth + seasonNumber - 2) / 12);
  const targetMonth = ((baseMonth + seasonNumber - 2) % 12) + 1;
  
  const startDate = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999); // Last day of month
  
  // Format season name in Chinese
  const seasonName = `第 ${seasonNumber} 季：${targetYear}年${targetMonth}月`;
  
  return {
    code: `S${seasonNumber}`,
    name: seasonName,
    startDate,
    endDate,
  };
}

/**
 * Generate seasons list up to current season
 */
export function generateSeasonsUpToCurrent(): Season[] {
  const current = getCurrentSeason();
  const seasons: Season[] = [];
  
  const baseYear = 2026;
  const baseMonth = 1;
  const currentSeasonNumber = parseInt(current.code.replace('S', ''), 10);
  
  for (let i = 1; i <= currentSeasonNumber; i++) {
    const targetYear = baseYear + Math.floor((baseMonth + i - 2) / 12);
    const targetMonth = ((baseMonth + i - 2) % 12) + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    
    seasons.push({
      code: `S${i}`,
      name: `第 ${i} 季：${targetYear}年${targetMonth}月`,
      startDate,
      endDate,
    });
  }
  
  return seasons;
}

/**
 * Default seasons list
 * TODO: Fetch from API GET /users/leaderboard/seasons
 */
export const DEFAULT_SEASONS: Season[] = generateSeasonsUpToCurrent();


