import type { Market } from "../types/market";
import { normalizeMarket } from "./normalizeMarket";
import { bffServerFetch } from "@/core/api/bffServerFetch";

/**
 * Backend market list response type
 */
interface BackendMarketListItem {
  id: string;
  shortCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  volume: number;
  totalVolume: number;
  tags: string[];
  updatedAt: string;
  options: Array<{
    id: string;
    name: string;
    betCount: number;
    volume: number;
    yesVolume?: number;
    noVolume?: number;
  }>;
  votePercentage?: Record<string, number>;
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  category?: {
    id: string;
    name: string;
    iconUrl?: string | null;
  } | null;
  categoryId?: string | null;
  participantsCount?: number;
  creator?: {
    id: string;
    displayName: string;
    name?: string;
    username?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
  } | null;
  createdBy?: string | null;
  status?: string;
  closeTime?: string;
  isOfficial?: boolean;
}

/**
 * Get all markets from Railway backend API
 * 
 * @param params - Query parameters (status, search, categoryId, creatorId)
 * @param revalidate - ISR revalidation time in seconds (default: 60)
 * @returns Array of normalized Market objects
 */
export async function getMarkets(
  params?: {
    status?: string;
    search?: string;
    categoryId?: string;
    creatorId?: string;
  },
  revalidate: number | false = 60,
): Promise<Market[]> {
  // Build query string (exclude userId for public pages)
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params?.creatorId) queryParams.append("creatorId", params.creatorId);

  const queryString = queryParams.toString();
  const url = `/api/markets${queryString ? `?${queryString}` : ""}`;

  try {
    const backendMarkets = await bffServerFetch<BackendMarketListItem[]>(url, {
      method: "GET",
      next: { revalidate },
    });

    // Normalize each market to frontend format
    return backendMarkets.map(normalizeMarket);
  } catch (error) {
    console.error("[getMarkets] Failed to fetch markets:", error);
    // Return empty array on error (graceful degradation)
    return [];
  }
}
