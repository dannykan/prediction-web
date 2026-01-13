/**
 * GET /api/admin/markets/[marketId] - Get market by ID
 * PATCH /api/admin/markets/[marketId] - Update market
 * DELETE /api/admin/markets/[marketId] - Delete market
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
    const { marketId } = await params;
    const apiBaseUrl = getApiBaseUrl();

    console.log("[API /api/admin/markets/[marketId] GET] Fetching market:", {
      marketId,
    });

    // Backend doesn't have GET /admin/markets/:marketId endpoint
    // Use regular /markets/:marketId endpoint instead
    const response = await fetch(`${apiBaseUrl}/markets/${marketId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error("[API /api/admin/markets/[marketId] GET] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${apiBaseUrl}/markets/${marketId}`,
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log("[API /api/admin/markets/[marketId] GET] Success");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/markets/[marketId] GET] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    console.log("[API /api/admin/markets/[marketId] PATCH] Updating market:", {
      marketId,
      body,
    });

    // Use admin endpoint for admin updates
    const response = await fetch(`${apiBaseUrl}/admin/markets/${marketId}`, {
      method: "PATCH",
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
      console.error("[API /api/admin/markets/[marketId] PATCH] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${apiBaseUrl}/admin/markets/${marketId}`,
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log("[API /api/admin/markets/[marketId] PATCH] Success:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/markets/[marketId] PATCH] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    // Backend /admin/markets/:marketId DELETE may not require authentication
    // Admin access is already protected by admin_session cookie
    const response = await fetch(`${apiBaseUrl}/admin/markets/${marketId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true", // Indicate this is an admin request
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
    console.error("[API /api/admin/markets/[marketId] DELETE] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
