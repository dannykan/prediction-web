/**
 * GET /api/markets/[id]
 * Forward to backend GET /markets/:id
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

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
      ? `${API_BASE_URL}/markets/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/markets/${encodeURIComponent(id)}`;
    
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
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
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

