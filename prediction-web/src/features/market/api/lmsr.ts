/**
 * LMSR Trading API
 */

export type TradeSide = 'BUY_YES' | 'SELL_YES' | 'BUY_NO' | 'SELL_NO';
export type AmountType = 'COIN' | 'SHARES';

export interface QuoteDto {
  side: TradeSide;
  amountType: AmountType;
  amount: string; // decimal string
}

export interface QuoteResult {
  side: TradeSide;
  amountType: AmountType;
  inputAmount: string;
  shares: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  priceYesBefore: string;
  priceYesAfter: string;
  qYesBefore: string;
  qYesAfter: string;
  qNoBefore: string;
  qNoAfter: string;
}

export interface OptionMarket {
  id: string;
  optionId: string;
  b: string;
  qYes: string;
  qNo: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  positionId: string;
  optionMarketId: string;
  optionId: string;
  optionName: string;
  side: 'YES' | 'NO';
  shares: string;
  totalCost: string; // Total G coin invested
  currentValue: string; // Current value if closed now
  profitLoss: string; // currentValue - totalCost
  profitLossPercent: string; // (profitLoss / totalCost) * 100
  probabilityChange: string; // Probability change after investment (in percentage points)
  currentProbability: string; // Current probability (priceYes or priceNo) in percentage
  firstTradeAt: string;
  lastTradeAt: string;
  bundleGroupId?: string | null;
  isBundle: boolean;
}

export interface OptionMarketInfo {
  id: string;
  optionId: string;
  optionName: string;
  b: string;
  qYes: string;
  qNo: string;
  priceYes: string;
  priceNo: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
}

export interface ExclusiveOutcomeInfo {
  outcomeId: string;
  optionId: string | null;
  type: 'OPTION' | 'NONE';
  displayOrder: number;
  price: string; // probability
  q: string; // quantity
  optionName?: string | null;
}

export interface ExclusiveMarketInfo {
  exclusiveMarketId: string;
  questionId: string;
  b: string;
  status: string;
  outcomes: ExclusiveOutcomeInfo[];
}

export interface ExclusivePosition {
  positionId: string;
  outcomeId: string;
  optionId: string | null;
  optionName: string;
  side: 'YES' | 'NO';
  shares: string;
  totalCost: string;
  currentValue: string;
  profitLoss: string;
  profitLossPercent: string;
  probabilityChange: string;
  currentProbability: string;
  firstTradeAt: string;
  lastTradeAt: string;
}

/**
 * Get all option markets for a market
 */
export async function getOptionMarketsByMarketId(marketId: string): Promise<OptionMarketInfo[]> {
  const response = await fetch(
    `/api/option-markets/market/${marketId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get exclusive market by marketId (for single choice questions)
 */
export async function getExclusiveMarketByMarketId(marketId: string): Promise<ExclusiveMarketInfo> {
  const response = await fetch(
    `/api/exclusive-markets/market/${marketId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface ExclusiveQuoteDto {
  exclusiveMarketId: string;
  outcomeId: string;
  side: TradeSide;
  amountType: AmountType;
  amount: string;
}

export interface ExclusiveQuoteResult {
  side: TradeSide;
  amountType: AmountType;
  inputAmount: string;
  outcomeId: string;
  outcomeType: 'OPTION' | 'NONE';
  optionId: string | null;
  displayOrder: number;
  shares: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  priceBefore: string;
  priceAfter: string;
  qBefore: string;
  qAfter: string;
  allPricesBefore: Array<{ outcomeId: string; price: string }>;
  allPricesAfter: Array<{ outcomeId: string; price: string }>;

  // Debug fields: probabilities before/after for all outcomes (in percentage)
  probBefore?: Array<{
    outcomeId: string;
    optionId: string | null;
    probability: string;
    probabilityPercent: string;
  }>;
  probAfter?: Array<{
    outcomeId: string;
    optionId: string | null;
    probability: string;
    probabilityPercent: string;
  }>;
}

/**
 * Get quote for exclusive market trade
 */
export async function quoteExclusiveMarket(
  exclusiveMarketId: string,
  dto: Omit<ExclusiveQuoteDto, 'exclusiveMarketId'>,
  token?: string,
): Promise<ExclusiveQuoteResult> {
  const response = await fetch(
    `/api/exclusive-markets/${exclusiveMarketId}/quote`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Execute exclusive market trade
 */
export async function tradeExclusiveMarket(
  exclusiveMarketId: string,
  dto: Omit<ExclusiveQuoteDto, 'exclusiveMarketId'>,
  token?: string,
): Promise<ExclusiveQuoteResult> {
  const response = await fetch(
    `/api/exclusive-markets/${exclusiveMarketId}/trade`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get quote for a trade
 */
export async function quoteOptionMarket(
  optionMarketId: string,
  dto: QuoteDto,
  token?: string,
): Promise<QuoteResult> {
  const response = await fetch(
    `/api/option-markets/${optionMarketId}/quote`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Execute a trade
 */
export async function tradeOptionMarket(
  optionMarketId: string,
  dto: QuoteDto,
  token?: string,
): Promise<QuoteResult> {
  const response = await fetch(
    `/api/option-markets/${optionMarketId}/trade`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Bundle Quote DTO (for single choice Buy No(i))
 */
export interface BundleQuoteDto {
  marketId: string;
  bundleType: 'BUY_YES' | 'BUY_NO';
  targetOptionId: string;
  amountType: AmountType;
  amount: string;
}

/**
 * Bundle Quote Result
 */
export interface BundleQuoteResult {
  bundleType: 'BUY_YES' | 'BUY_NO';
  marketId: string;
  targetOptionId: string;
  amountType: AmountType;
  inputAmount: string;
  totalGrossAmount: string;
  totalFeeAmount: string;
  totalNetAmount: string;
  averagePrice: string;
  totalShares: string;
  components: Array<{
    optionMarketId: string;
    optionId: string;
    optionName: string;
    side: 'BUY_YES' | 'BUY_NO';
    allocatedAmount: string;
    shares: string;
    grossAmount: string;
    feeAmount: string;
    netAmount: string;
    priceYesBefore: string;
    priceYesAfter: string;
    qYesBefore: string;
    qYesAfter: string;
    qNoBefore: string;
    qNoAfter: string;
  }>;
}

/**
 * Get bundle quote (for single choice Buy No(i))
 */
export async function bundleQuote(
  dto: BundleQuoteDto,
  token?: string,
): Promise<BundleQuoteResult> {
  const response = await fetch(
    `/api/option-markets/bundle/quote`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Execute bundle trade (for single choice Buy No(i))
 */
export async function bundleTrade(
  dto: BundleQuoteDto,
  token?: string,
): Promise<BundleQuoteResult> {
  const response = await fetch(
    `/api/option-markets/bundle/trade`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get user positions for a market (option markets)
 * Returns empty array if user is not authenticated (401)
 */
export async function getUserPositions(
  marketId: string,
  token?: string,
): Promise<Position[]> {
  try {
    const response = await fetch(
      `/api/option-markets/market/${marketId}/positions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      },
    );

    if (!response.ok) {
      // If not authenticated, return empty array silently
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      // For other errors, try to parse error message
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}`);
      }
    }

    return response.json();
  } catch (error: any) {
    // If it's a network error or 401/403, return empty array
    if (error.message?.includes('401') || 
        error.message?.includes('403') || 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Forbidden')) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get user positions for an exclusive market by marketId
 * Returns empty array if user is not authenticated (401) or no exclusive market exists
 */
export async function getExclusiveMarketPositions(
  marketId: string,
  token?: string,
): Promise<ExclusivePosition[]> {
  try {
    const response = await fetch(
      `/api/exclusive-markets/market/${marketId}/positions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      },
    );

    if (!response.ok) {
      // If not authenticated, return empty array silently
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      // For other errors, try to parse error message
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}`);
      }
    }

    return response.json();
  } catch (error: any) {
    // If it's a network error or 401/403, return empty array
    if (error.message?.includes('401') || 
        error.message?.includes('403') || 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Forbidden')) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

