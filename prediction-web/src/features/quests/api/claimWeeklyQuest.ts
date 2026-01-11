import type { ClaimRewardResponse } from "../types/quest";

export async function claimWeeklyQuest(
  userId: string,
  questId: number
): Promise<ClaimRewardResponse> {
  const response = await fetch(
    `/api/users/${userId}/quests/${questId}/claim`,
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

