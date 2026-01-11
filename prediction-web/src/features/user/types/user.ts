/**
 * User type definitions
 */

export interface User {
  id: string;
  username?: string | null;
  displayName: string;
  name?: string;
  avatarUrl?: string | null;
  coinBalance?: number;
  email?: string | null;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  referralCode?: string | null;
  referredBy?: string | null;
}



