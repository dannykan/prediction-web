/**
 * GET /api/admin/bots/activity - Get recent bot activity logs
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const backendUrl = `${apiBaseUrl}/admin/bots/activity${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/bots/activity] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot activity" },
      { status: 500 }
    );
  }
}
