/**
 * Hook to handle referral code from URL parameter
 * Stores the referral code in localStorage and can be used after login
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const REFERRAL_CODE_STORAGE_KEY = 'pending_referral_code';

export function useReferralCodeFromUrl() {
  const searchParams = useSearchParams();
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameter for referral code
    const refCode = searchParams.get('ref');
    
    if (refCode && refCode.trim()) {
      // Store in localStorage for later use
      const code = refCode.trim().toUpperCase();
      localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
      setPendingReferralCode(code);
    } else {
      // Check if there's a stored referral code
      const storedCode = localStorage.getItem(REFERRAL_CODE_STORAGE_KEY);
      if (storedCode) {
        setPendingReferralCode(storedCode);
      }
    }
  }, [searchParams]);

  /**
   * Get the pending referral code from storage
   */
  const getPendingReferralCode = (): string | null => {
    return localStorage.getItem(REFERRAL_CODE_STORAGE_KEY);
  };

  /**
   * Clear the pending referral code from storage
   */
  const clearPendingReferralCode = (): void => {
    localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
    setPendingReferralCode(null);
  };

  return {
    pendingReferralCode,
    getPendingReferralCode,
    clearPendingReferralCode,
  };
}
