/**
 * Get user PnL (Profit and Loss) history
 * Calls BFF /api/users/[id]/stats/pnl
 */

export interface PnLDataPoint {
  date: string; // YYYY-MM-DD format
  value: number; // Cumulative PnL
}

export async function getPnLHistory(
  userId: string,
  days: number | "all" = 7,
): Promise<PnLDataPoint[]> {
  try {
    const daysParam = days === "all" ? "ALL" : days.toString();
    const url = `/api/users/${encodeURIComponent(userId)}/stats/pnl?days=${daysParam}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(
        `Failed to fetch PnL history: ${response.statusText}`,
      );
    }

    const data = await response.json();
    
    // Backend returns Array<{ date: string; value: number }>
    if (Array.isArray(data)) {
      return data;
    }
    
    // If backend returns object with data property
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("[getPnLHistory] Failed to fetch PnL history:", error);
    throw error;
  }
}
