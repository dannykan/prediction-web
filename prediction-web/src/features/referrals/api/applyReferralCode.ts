/**
 * Apply referral code
 * Calls BFF /api/referrals/apply
 */

export interface ApplyReferralCodeResponse {
  success: boolean;
  message: string;
}

export async function applyReferralCode(
  userId: string,
  referralCode: string,
  deviceId: string,
): Promise<ApplyReferralCodeResponse> {
  try {
    const response = await fetch(
      `/api/referrals/apply?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralCode,
          deviceId,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "申請邀請碼失敗",
      }));
      throw new Error(errorData.message || `申請失敗: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[applyReferralCode] Failed to apply referral code:", error);
    throw error;
  }
}
