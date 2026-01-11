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
    
    // Get auth token from request (handles both cookies and headers)
    const token = await getAuthTokenFromRequest(request);
    
    // Note: This endpoint requires authentication, but we allow it to return empty array
    // if user is not authenticated (for better UX)
    const response = await fetch(
      `${API_BASE_URL}/exclusive-markets/market/${marketId}/positions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      // If unauthorized, return empty array (user not logged in)
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
    console.error("[API /exclusive-markets/market/:marketId/positions] Error:", error);
    // Return empty array on error (for better UX)
    return NextResponse.json([]);
  }
}

