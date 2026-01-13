/**
 * GET /api/markets/[id]
 * Forward to backend GET /markets/:id
 */

import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!id) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 },
      );
    }

    // Forward to backend
    const backendUrl = userId
      ? `${getApiBaseUrl()}/markets/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`
      : `${getApiBaseUrl()}/markets/${encodeURIComponent(id)}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward authorization header if present
        ...(request.headers.get("Authorization") && {
          Authorization: request.headers.get("Authorization")!,
        }),
      },
      // Don't cache this request - we want fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        console.error("[API /api/markets/[id]] Backend error response text:", text);
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || "Backend request failed" };
        }
      } catch (e) {
        errorData = { error: "Backend request failed" };
      }
      
      console.error("[API /api/markets/[id]] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: backendUrl,
      });
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Debug log to check if statistics data is present
    if (process.env.NODE_ENV === 'development') {
      console.log('[BFF /api/markets/[id]] Received data:', {
        tradeCount: data.tradeCount,
        usersWithPositions: data.usersWithPositions,
        commentsCount: data.commentsCount,
        totalVolume: data.totalVolume,
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/markets/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

