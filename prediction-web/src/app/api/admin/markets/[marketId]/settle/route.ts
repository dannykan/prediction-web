/**
 * POST /api/admin/markets/[marketId]/settle
 * Settle a market
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    // Forward to admin endpoint for proper authentication
    const response = await fetch(`${apiBaseUrl}/admin/markets/${marketId}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
      body: JSON.stringify(body),
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
    console.error("[API /api/admin/markets/[marketId]/settle] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
