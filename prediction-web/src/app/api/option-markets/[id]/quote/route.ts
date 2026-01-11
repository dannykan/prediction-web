import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Quote endpoint is public - no authentication required
    const token = await getAuthTokenFromRequest(request);
    const { id } = await params;
    const body = await request.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Only add Authorization header if token exists (optional)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${getApiBaseUrl()}/option-markets/${id}/quote`, {
      method: "POST",
      headers,
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
    console.error("[API /option-markets/quote] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

