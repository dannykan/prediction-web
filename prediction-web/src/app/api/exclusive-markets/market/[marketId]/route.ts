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
        { status: 400 }
      );
    }

    const response = await fetch(
      `${getApiBaseUrl()}/exclusive-markets/market/${marketId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    // 如果市場不存在（404），返回默認結構而不是錯誤
    if (response.status === 404) {
      console.log(`[API /exclusive-markets/market] Market ${marketId} not found, returning default structure`);
      return NextResponse.json({
        exclusiveMarketId: "",
        outcomes: [],
      });
    }

    if (!response.ok) {
      // 對於其他錯誤，也返回默認結構以避免前端崩潰
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error(`[API /exclusive-markets/market] Backend error for market ${marketId}:`, {
        status: response.status,
        error: errorData,
      });
      // 返回默認結構而不是錯誤，讓前端可以正常顯示
      return NextResponse.json({
        exclusiveMarketId: "",
        outcomes: [],
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /exclusive-markets/market/:marketId] Error:", error);
    // 返回默認結構而不是錯誤，讓前端可以正常顯示
    return NextResponse.json({
      exclusiveMarketId: "",
      outcomes: [],
    });
  }
}



