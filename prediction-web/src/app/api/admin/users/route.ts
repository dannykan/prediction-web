/**
 * GET /api/admin/users - Get all users with search and pagination
 * Forward to backend GET /users
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const backendUrl = `${apiBaseUrl}/users${queryString ? `?${queryString}` : ""}`;

    // Backend /users API doesn't require authentication
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorData: any;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : { error: "Backend request failed" };
      } catch {
        errorData = {
          error: "Backend request failed",
          message: `Backend returned ${response.status}`,
        };
      }
      
      console.error("[API /api/admin/users] Backend error:", {
        status: response.status,
        error: errorData,
        url: backendUrl,
        searchParams: request.nextUrl.searchParams.toString(),
      });
      
      return NextResponse.json(
        {
          error: errorData.error || errorData.message || "Backend request failed",
          message: errorData.message || errorData.error || `Backend returned ${response.status}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/users] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
