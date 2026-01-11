export async function resetQuests(userId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/users/${userId}/reset-quests`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to reset quests" }));
    throw new Error(error.error || "Failed to reset quests");
  }

  return response.json();
}

