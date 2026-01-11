/**
 * GET /api/markets/[id]/comments
 * POST /api/markets/[id]/comments
 * Forward to backend GET/POST /markets/:id/comments
 */

import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 },
      );
    }

    // Get query parameters from request
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string (preserve all query params)
    const queryString = searchParams.toString();
    const backendUrl = `${getApiBaseUrl()}/markets/${encodeURIComponent(id)}/comments${queryString ? `?${queryString}` : ""}`;

    // Forward to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Allow caching for public comments
      next: { revalidate: 60 },
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
    console.error("[API /api/markets/[id]/comments] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    const queryString = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const backendUrl = `${getApiBaseUrl()}/markets/${encodeURIComponent(id)}/comments${queryString}`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("[API /api/markets/[id]/comments] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
