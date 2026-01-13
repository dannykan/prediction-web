/**
 * GET /api/exclusive-markets/market/[marketId]/all-trades
 * Forward to backend GET /exclusive-markets/market/:marketId/all-trades
 */

import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    
    if (!marketId) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 },
      );
    }

    const backendUrl = `${getApiBaseUrl()}/exclusive-markets/market/${encodeURIComponent(marketId)}/all-trades`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // 如果市場不存在或沒有交易數據，返回默認結構而不是錯誤
    if (response.status === 404) {
      console.log(`[API /exclusive-markets/market/all-trades] Market ${marketId} not found, returning default structure`);
      return NextResponse.json({ trades: [], initialPrices: [] });
    }

    if (!response.ok) {
      // 對於其他錯誤（如 500），也返回默認結構以避免前端崩潰
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error(`[API /exclusive-markets/market/all-trades] Backend error for market ${marketId}:`, {
        status: response.status,
        error: errorData,
      });
      // 返回默認結構而不是錯誤，讓前端可以正常顯示
      return NextResponse.json({ trades: [], initialPrices: [] });
    }

    const data = await response.json();
    // 確保返回的是正確的結構
    if (data && typeof data === 'object' && Array.isArray(data.trades)) {
      return NextResponse.json(data);
    } else if (Array.isArray(data)) {
      // 如果是數組，轉換為對象格式
      return NextResponse.json({ trades: data, initialPrices: [] });
    }
    return NextResponse.json({ trades: [], initialPrices: [] });
  } catch (error) {
    console.error("[API /api/exclusive-markets/market/[marketId]/all-trades] Error:", error);
    // 返回默認結構而不是錯誤，讓前端可以正常顯示
    return NextResponse.json({ trades: [], initialPrices: [] });
  }
}

