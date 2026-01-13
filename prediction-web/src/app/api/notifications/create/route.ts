/**
 * POST /api/notifications/create
 * Create a notification for a user
 * Forward to backend POST /notifications/create
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 },
      );
    }

    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Forward to backend
    const backendUrl = `${getApiBaseUrl()}/notifications/create?userId=${encodeURIComponent(userId)}`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
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
    console.error("[API /api/notifications/create] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
