/**
 * GET /api/admin/markets/[marketId]/comments
 * Get all comments for a market (Admin only)
 * Forward to backend GET /admin/markets/:marketId/comments
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const { marketId } = await params;

    // Backend /admin/markets/:marketId/comments requires admin authentication
    const response = await fetch(`${apiBaseUrl}/admin/markets/${marketId}/comments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
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
    console.error("[API /api/admin/markets/[marketId]/comments] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
