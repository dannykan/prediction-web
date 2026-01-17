/**
 * GET /api/admin/feedback - Get all feedbacks (Admin only)
 * Forward to backend GET /feedback
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();

    const response = await fetch(`${apiBaseUrl}/feedback`, {
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
    console.error("[API /api/admin/feedback GET] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
