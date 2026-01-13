/**
 * GET /api/markets - List markets
 * POST /api/markets - Create market
 * Forward to backend /markets
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(request: NextRequest) {
  try {
    // Check if API base URL is configured
    let apiBaseUrl: string;
    try {
      apiBaseUrl = getApiBaseUrl();
    } catch (error) {
      console.error("[API /api/markets] Missing NEXT_PUBLIC_API_BASE_URL:", error);
      return NextResponse.json(
        {
          error: "CONFIGURATION_ERROR",
          message: "NEXT_PUBLIC_API_BASE_URL is not configured. Please set it in Cloudflare Pages environment variables.",
        },
        { status: 500 },
      );
    }

    // Get query parameters from request
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string (preserve all query params)
    const queryString = searchParams.toString();
    const backendUrl = `${apiBaseUrl}/markets${queryString ? `?${queryString}` : ""}`;

    // Forward to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Don't cache in Cloudflare Pages (use cache: "no-store" instead)
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
    console.error("[API /api/markets] Error:", error);
    
    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes("NEXT_PUBLIC_API_BASE_URL")) {
      return NextResponse.json(
        {
          error: "CONFIGURATION_ERROR",
          message: "NEXT_PUBLIC_API_BASE_URL is not configured. Please set it in Cloudflare Pages environment variables.",
        },
        { status: 500 },
      );
    }
    
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Forward to backend
    const response = await fetch(`${getApiBaseUrl()}/markets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store", // Don't cache POST requests
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[API /api/markets POST] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

