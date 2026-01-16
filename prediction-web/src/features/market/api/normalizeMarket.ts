/**
 * Normalize backend market data to frontend Market type
 */

import type { Market } from "../types/market";

/**
 * Generate slug from title
 * Replaces all symbols (except alphanumeric, Chinese, and hyphens) with hyphens
 * Removes trailing question marks
 */
function generateSlug(title: string): string {
  return title
    .trim()
    // Replace all symbols (non-alphanumeric, non-Chinese, non-hyphen) with hyphens
    // This includes: !@#$%^&*()_+=[]{}|;:'",.<>?/~` etc.
    .replace(/[^\p{L}\p{N}-]/gu, "-") // \p{L} = any letter (including Chinese), \p{N} = any number
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .replace(/\?+$/, ""); // Remove trailing question marks
}

/**
 * Normalize URL part (shortcode or slug) by replacing all symbols with hyphens
 * This ensures URLs don't break when shared on social platforms
 */
export function normalizeUrlPart(part: string): string {
  if (!part) return part;
  return part
    .trim()
    // Replace all symbols (non-alphanumeric, non-Chinese, non-hyphen) with hyphens
    .replace(/[^\p{L}\p{N}-]/gu, "-")
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .replace(/\?+$/, ""); // Remove trailing question marks
}

/**
 * Backend market list response type (from GET /markets)
 */
interface BackendMarketListItem {
  id: string;
  shortCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  volume: number;
  totalVolume: number;
  commentsCount?: number;
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
  mechanism?: string; // 'LMSR_V2'
  yesProbability?: number | null; // YES probability from backend
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
 * Backend market detail response type (from GET /markets/by-code/:code)
 */
interface BackendMarketDetail {
  id: string;
  shortCode?: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  volume: number;
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
  mechanism?: string; // 'LMSR_V2'
  // Statistics fields
  tradeCount?: number;
  usersWithPositions?: number;
  commentsCount?: number;
  totalVolume?: number;
}

/**
 * Calculate yes/no percentages from options and votePercentage
 */
function calculateYesNoPercentages(
  options: BackendMarketListItem["options"],
  votePercentage?: Record<string, number>,
): { yesPercentage: number; noPercentage: number } {
  // If votePercentage is provided, use it
  if (votePercentage) {
    // Find Yes/No options (case-insensitive)
    let yesOption: string | undefined;
    let noOption: string | undefined;

    for (const option of options) {
      const nameLower = option.name.toLowerCase();
      if (nameLower === "yes" || nameLower === "是" || nameLower === "會") {
        yesOption = option.id;
      } else if (nameLower === "no" || nameLower === "否" || nameLower === "不會") {
        noOption = option.id;
      }
    }

    // If we found Yes/No options, use votePercentage
    if (yesOption && noOption) {
      const yes = votePercentage[yesOption] || 0;
      const no = votePercentage[noOption] || 0;
      const total = yes + no;
      
      if (total > 0) {
        return {
          yesPercentage: (yes / total) * 100,
          noPercentage: (no / total) * 100,
        };
      }
    }

    // Fallback: use first two options if votePercentage exists
    const optionIds = Object.keys(votePercentage);
    if (optionIds.length >= 2) {
      const first = votePercentage[optionIds[0]] || 0;
      const second = votePercentage[optionIds[1]] || 0;
      const total = first + second;
      
      if (total > 0) {
        return {
          yesPercentage: (first / total) * 100,
          noPercentage: (second / total) * 100,
        };
      }
    }
  }

  // Fallback: calculate from option volumes
  if (options.length >= 2) {
    const firstVolume = options[0]?.volume || 0;
    const secondVolume = options[1]?.volume || 0;
    const total = firstVolume + secondVolume;

    if (total > 0) {
      return {
        yesPercentage: (firstVolume / total) * 100,
        noPercentage: (secondVolume / total) * 100,
      };
    }
  }

  // Default: 50/50
  return {
    yesPercentage: 50,
    noPercentage: 50,
  };
}

/**
 * Normalize backend market list item to frontend Market type
 */
export function normalizeMarket(
  backendMarket: BackendMarketListItem | BackendMarketDetail,
): Market {
  // Extract shortcode - handle both camelCase and potential variations
  const shortcode = 
    (backendMarket as any).shortCode || 
    (backendMarket as any).short_code || 
    (backendMarket as any).id;

  if (!shortcode) {
    throw new Error(`Market missing shortcode: ${JSON.stringify(backendMarket)}`);
  }

  let slug = generateSlug(backendMarket.title);
  // Ensure slug is normalized (replace all symbols with hyphens, remove trailing question marks)
  slug = normalizeUrlPart(slug);
  
  const { yesPercentage, noPercentage } = calculateYesNoPercentages(
    backendMarket.options,
    backendMarket.votePercentage,
  );

  // Use totalVolume if available (from list API), otherwise use volume (from detail API)
  const totalVolume = "totalVolume" in backendMarket && backendMarket.totalVolume !== undefined
    ? backendMarket.totalVolume 
    : backendMarket.volume || 0;

  // Normalize questionType
  const questionType = (() => {
    const qType = (backendMarket as any).questionType;
    if (!qType) return 'YES_NO' as const;
    if (qType === 'YES_NO' || qType === 'binary') return 'YES_NO' as const;
    if (qType === 'SINGLE_CHOICE' || qType === 'single') return 'SINGLE_CHOICE' as const;
    if (qType === 'MULTIPLE_CHOICE' || qType === 'multiple') return 'MULTIPLE_CHOICE' as const;
    return 'YES_NO' as const;
  })();

  // Check if official market (createdBy is null or specific system user)
  const isOfficial = !(backendMarket as any).createdBy || 
                     (backendMarket as any).isOfficial === true;

  // Resolve image URL (handle relative URLs)
  const resolveImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    // For relative URLs, prepend API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (!baseUrl || baseUrl === 'https://example.com') return url; // Return as-is if base URL not configured
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
  };

  // Resolve creator avatar URL
  const creator = (backendMarket as any).creator;
  const resolvedCreator = creator ? {
    ...creator,
    avatarUrl: creator.avatarUrl ? resolveImageUrl(creator.avatarUrl) : undefined,
  } : null;

  // Normalize shortcode to ensure no symbols break URLs
  const normalizedShortcode = normalizeUrlPart(String(shortcode));
  const normalizedSlug = normalizeUrlPart(slug);
  
  return {
    id: backendMarket.id || String(shortcode),
    shortcode: normalizedShortcode,
    code: normalizedShortcode, // Alias for shortcode
    slug: normalizedSlug,
    title: backendMarket.title,
    description: backendMarket.description || "",
    imageUrl: resolveImageUrl(backendMarket.imageUrl),
    yesPercentage,
    noPercentage,
    totalVolume,
    tags: backendMarket.tags || [],
    createdAt: (backendMarket as any).createdAt || (backendMarket as any).created_at || undefined,
    updatedAt: backendMarket.updatedAt,
    questionType,
    optionsCount: backendMarket.options.length,
    options: backendMarket.options.map(opt => ({ id: opt.id, name: opt.name })), // 保留 options 用於前端顯示
    participantsCount: (backendMarket as any).participantsCount,
    category: (backendMarket as any).category || null,
    creator: resolvedCreator,
    creatorId: (backendMarket as any).createdBy || (backendMarket as any).creatorId || resolvedCreator?.id || undefined,
    isOfficial,
    status: (backendMarket as any).status,
    closeTime: (backendMarket as any).closeTime,
    resolutionRules: (backendMarket as any).resolutionRules || null,
    mechanism: (backendMarket as any).mechanism, // Include mechanism field
    // Statistics fields
    tradeCount: (backendMarket as any).tradeCount,
    usersWithPositions: (backendMarket as any).usersWithPositions,
    commentsCount: (backendMarket as any).commentsCount,
    // Probability from backend (if available)
    yesProbability: (backendMarket as any).yesProbability !== undefined 
      ? (backendMarket as any).yesProbability 
      : undefined,
  };
}

