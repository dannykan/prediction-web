/**
 * Get referral statistics
 * Calls BFF /api/referrals/stats
 */

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingRewards: number;
  unlockedRewards: number;
  totalEarned: number;
  shareUrl: string;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const response = await fetch(
      `/api/referrals/stats?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Don't cache authenticated requests
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error(`Failed to fetch referral stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getReferralStats] Failed to fetch referral stats:", error);
    throw error;
  }
}
