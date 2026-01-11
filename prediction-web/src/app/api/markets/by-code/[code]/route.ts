/**
 * GET /api/markets/by-code/[code]
 * Forward to backend GET /markets/by-code/:code
 */

import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    
    if (!code) {
      return NextResponse.json(
        { error: "Market code is required" },
        { status: 400 },
      );
    }

    // Forward to backend
    const backendUrl = `${getApiBaseUrl()}/markets/by-code/${encodeURIComponent(code)}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Allow caching for public market details
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Debug log to check if statistics data is present
    if (process.env.NODE_ENV === 'development') {
      console.log('[BFF /api/markets/by-code] Received data:', {
        tradeCount: data.tradeCount,
        usersWithPositions: data.usersWithPositions,
        commentsCount: data.commentsCount,
        totalVolume: data.totalVolume,
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/markets/by-code] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}


