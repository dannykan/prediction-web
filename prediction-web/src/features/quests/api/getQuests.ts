import type { QuestsResponse } from "../types/quest";

export async function getQuests(userId: string): Promise<QuestsResponse> {
  const response = await fetch(`/api/users/${userId}/quests`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch quests" }));
    throw new Error(error.error || "Failed to fetch quests");
  }

  return response.json();
}

