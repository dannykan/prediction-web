import type { ClaimRewardResponse } from "../types/quest";

export async function claimCompletionBonus(
  userId: string
): Promise<ClaimRewardResponse> {
  const response = await fetch(
    `/api/users/${userId}/quests/completion-bonus/claim`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to claim completion bonus" }));
    throw new Error(error.error || "Failed to claim completion bonus");
  }

  return response.json();
}

