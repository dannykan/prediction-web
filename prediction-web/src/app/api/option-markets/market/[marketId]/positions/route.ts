import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const token = await getAuthTokenFromRequest(request);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/option-markets/${marketId}/positions`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      // If 401/403, return empty array (user not authenticated)
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json([]);
      }

      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /option-markets/market/:marketId/positions] Error:", error);
    // Return empty array on error (user may not be logged in)
    return NextResponse.json([]);
  }
}

