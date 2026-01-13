/**
 * PATCH /api/admin/categories/reorder - Reorder categories
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function PATCH(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    const response = await fetch(`${apiBaseUrl}/categories/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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
    console.error("[API /api/admin/categories/reorder] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
