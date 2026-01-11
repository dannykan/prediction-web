/**
 * POST /api/markets/[id]/comments/[commentId]/like
 * Forward to backend POST /markets/:id/comments/:commentId/like
 */

import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id, commentId } = await params;
    
    if (!id || !commentId) {
      return NextResponse.json(
        { error: "Market ID and Comment ID are required" },
        { status: 400 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }
    
    const queryString = `?userId=${encodeURIComponent(userId)}`;
    // Backend route is POST /comments/:id/like (not /markets/:id/comments/:commentId/like)
    const backendUrl = `${getApiBaseUrl()}/comments/${encodeURIComponent(commentId)}/like${queryString}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/markets/[id]/comments/[commentId]/like] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

