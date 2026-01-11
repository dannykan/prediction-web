/**
 * GET /api/users/leaderboard/my-rank
 * Forward to backend GET /users/leaderboard/my-rank with Bearer token
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(request: NextRequest) {
  try {
    const token = await getAuthTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const timeframe = searchParams.get("timeframe");
    const season = searchParams.get("season");

    // Build query string
    const queryParams = new URLSearchParams();
    if (type) queryParams.append("type", type);
    if (timeframe) queryParams.append("timeframe", timeframe);
    if (season) queryParams.append("season", season);

    const queryString = queryParams.toString();
    const backendUrl = `${getApiBaseUrl()}/users/leaderboard/my-rank${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Don't cache authenticated requests
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
    console.error("[API /api/users/leaderboard/my-rank] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

