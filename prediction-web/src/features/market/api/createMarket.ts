/**
 * Create market API function
 * Calls BFF /api/markets
 */

export type QuestionType = "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export interface MarketOption {
  id?: string;
  name: string;
}

export interface FirstBetSelection {
  selectionId: string; // 'yes' | 'no' | 'option_1' | 'option_2' 等
  stakeAmount: number;
  side: "YES" | "NO";
}

export interface CreateMarketRequest {
  title: string;
  description?: string;
  questionType: QuestionType;
  mechanism?: "LMSR_V2"; // Market mechanism type (always LMSR_V2)
  options: MarketOption[];
  categoryId?: string;
  closeTime: string; // ISO 8601 format
  imageUrl?: string;
  tags?: string[];
  rules?: Record<string, any>;
  // New flow parameters
  creationFee?: number;
  firstBetAmount?: number;
  firstBetSelections?: FirstBetSelection[];
  commissionRate?: number; // 0.015 = 1.5%
}

export interface CreateMarketResponse {
  market: {
    id: string;
    shortcode: string;
    title: string;
    description?: string;
    status: string;
    [key: string]: any;
  };
  transactions?: any[];
}

export async function createMarket(data: CreateMarketRequest): Promise<CreateMarketResponse> {
  const response = await fetch("/api/markets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to create market" }));
    throw new Error(errorData.message || `Failed to create market: ${response.statusText}`);
  }

  return response.json();
}

