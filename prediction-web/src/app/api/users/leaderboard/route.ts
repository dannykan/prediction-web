import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/core/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

/**
 * GET /api/users/leaderboard
 * Forward to backend GET /users/leaderboard
 * 
 * Query Parameters:
 * - type: 'gods' | 'whales' | 'losers' | 'winners'
 * - timeframe: 'season' | 'alltime'
 * - season: 'S1', 'S2', etc. (required if timeframe='season')
 * - limit: number (default: 50)
 * - userId: string (optional, for getting current user rank)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const timeframe = searchParams.get("timeframe");
    const season = searchParams.get("season");
    const limit = searchParams.get("limit") || "50";
    const userId = searchParams.get("userId");

    // Build query string
    const queryParams = new URLSearchParams();
    if (type) queryParams.append("type", type);
    if (timeframe) queryParams.append("timeframe", timeframe);
    if (season) queryParams.append("season", season);
    queryParams.append("limit", limit);
    if (userId) queryParams.append("userId", userId);

    const queryString = queryParams.toString();
    const backendUrl = `${API_BASE_URL}/users/leaderboard${queryString ? `?${queryString}` : ""}`;

    // Get auth token for authenticated requests
    const token = await getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store", // Don't cache leaderboard data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Backend request failed" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/users/leaderboard] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}



