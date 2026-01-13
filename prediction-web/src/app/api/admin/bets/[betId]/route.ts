/**
 * DELETE /api/admin/bets/[betId]
 * Delete a bet and refund (Admin only)
 * Forward to backend DELETE /admin/bets/:betId
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { betId: string } }
) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const betId = params.betId;
    const body = await request.json();

    // Backend /admin/bets/:betId DELETE requires admin authentication
    const response = await fetch(`${apiBaseUrl}/admin/bets/${betId}`, {
      method: "DELETE",
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
    console.error("[API /api/admin/bets/[betId]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
