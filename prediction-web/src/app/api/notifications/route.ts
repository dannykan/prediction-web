import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const queryParams = new URLSearchParams({
      userId,
      page,
      limit,
    });

    const response = await fetch(`${getApiBaseUrl()}/notifications?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    // Backend returns { notifications: [], total, page, limit }
    // Return array format for compatibility
    return NextResponse.json(data.notifications || data);
  } catch (error) {
    console.error("[API /api/notifications] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
