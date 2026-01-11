/**
 * Get referral details
 * Calls BFF /api/referrals/details
 */

export interface ReferralDetail {
  id: string;
  refereeName: string;
  refereeLevel: number;
  refereeAvatar: string | null;
  requiredLevel: number;
  currentLevel: number;
  status: 'pending' | 'unlocked' | 'claimed';
  rewardAmount: number;
  createdAt: string;
  unlockedAt: string | null;
}

export async function getReferralDetails(userId: string): Promise<ReferralDetail[]> {
  try {
    const response = await fetch(
      `/api/referrals/details?userId=${encodeURIComponent(userId)}`,
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
      throw new Error(`Failed to fetch referral details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getReferralDetails] Failed to fetch referral details:", error);
    throw error;
  }
}
