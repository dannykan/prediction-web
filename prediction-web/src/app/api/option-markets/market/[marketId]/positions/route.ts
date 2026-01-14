import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const token = await getAuthTokenFromRequest(request);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Backend path: /option-markets/:marketId/positions (not /option-markets/market/:marketId/positions)
    const backendUrl = `${getApiBaseUrl()}/option-markets/${encodeURIComponent(marketId)}/positions`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      // If 404, market not found or no positions, return empty array
      if (response.status === 404) {
        console.log(`[API /option-markets/market/positions] Market ${marketId} not found or no positions, returning empty array`);
        return NextResponse.json([]);
      }
      
      // If 401/403, return empty array (user not authenticated)
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json([]);
      }

      // For other errors (like 500), log and return empty array to prevent frontend crashes
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error(`[API /option-markets/market/positions] Backend error for market ${marketId}:`, {
        status: response.status,
        error: errorData,
      });
      // Return empty array instead of error to prevent frontend crashes
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log(`[API /option-markets/market/positions] Market ${marketId} positions:`, {
      count: Array.isArray(data) ? data.length : 'not an array',
      data: Array.isArray(data) && data.length > 0 ? data.slice(0, 2) : data, // Log first 2 items
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /option-markets/market/:marketId/positions] Error:", error);
    // Return empty array on error (user may not be logged in)
    return NextResponse.json([]);
  }
}

