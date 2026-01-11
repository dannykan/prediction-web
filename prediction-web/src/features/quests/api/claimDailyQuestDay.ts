import type { ClaimRewardResponse } from "../types/quest";

export async function claimDailyQuestDay(
  userId: string,
  questId: number,
  dayIndex: number
): Promise<ClaimRewardResponse> {
  const response = await fetch(
    `/api/users/${userId}/quests/daily/${questId}/days/${dayIndex}/claim`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to claim reward" }));
    throw new Error(error.error || "Failed to claim reward");
  }

  return response.json();
}

