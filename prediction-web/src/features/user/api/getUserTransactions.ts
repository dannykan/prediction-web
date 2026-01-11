/**
 * Get user transaction history
 * Calls BFF /api/users/[id]/transactions
 */

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
  referenceId?: string | null;
  marketInfo?: {
    marketId: string;
    marketTitle: string;
    questionType: string;
    optionName?: string | null;
    side: 'YES' | 'NO';
    marketShortcode?: string | null;
  } | null;
}

export async function getUserTransactions(
  userId: string,
): Promise<Transaction[]> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}/transactions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache authenticated requests
    });

    if (!response.ok) {
      if (response.status === 401) {
        return []; // Not authenticated
      }
      throw new Error(
        `Failed to fetch user transactions: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[getUserTransactions] Failed to fetch user transactions:", error);
    return [];
  }
}

