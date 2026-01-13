/**
 * POST /api/admin/markets - Create a new market
 * Forward to backend POST /markets or POST /admin/markets
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    console.log("[API /api/admin/markets POST] Creating market:", {
      apiBaseUrl,
      bodyKeys: Object.keys(body),
      hasTitle: !!body.title,
      hasQuestionType: !!body.questionType,
    });

    // Try admin endpoint first, fallback to regular endpoint
    // Backend may require X-Admin-Authenticated header or may not require auth
    // Note: Only send one header to avoid Node.js fetch merging them into "true, true"
    const response = await fetch(`${apiBaseUrl}/admin/markets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true", // Indicate this is an admin request
      },
      body: JSON.stringify(body),
    });

    console.log("[API /api/admin/markets POST] Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error("[API /api/admin/markets POST] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${apiBaseUrl}/admin/markets`,
      });

      // Return the backend error response directly (don't fallback for admin endpoints)
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[API /api/admin/markets POST] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
