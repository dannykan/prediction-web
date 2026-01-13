/**
 * GET /api/me
 * Get current user information
 * Calls backend GET /me endpoint if available, otherwise returns 501
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

    // Check if API base URL is configured
    let apiBaseUrl: string;
    try {
      apiBaseUrl = getApiBaseUrl();
    } catch (error) {
      console.error("[API /me] Missing NEXT_PUBLIC_API_BASE_URL:", error);
      return NextResponse.json(
        {
          error: "CONFIGURATION_ERROR",
          message: "NEXT_PUBLIC_API_BASE_URL is not configured. Please set it in Cloudflare Pages environment variables.",
        },
        { status: 500 },
      );
    }

    // Try to call backend GET /me endpoint
    try {
      const response = await fetch(`${apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const user = await response.json();
        // Backend returns { user: {...} }, forward it as-is
        return NextResponse.json(user);
      }

      // If backend returns 404, it means /me endpoint doesn't exist
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "ME_ENDPOINT_NOT_IMPLEMENTED",
            message: "Backend /me endpoint is not implemented yet",
          },
          { status: 501 },
        );
      }

      // Other errors (401, 500, etc.) - forward the error
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    } catch (fetchError) {
      // Network error or other fetch issues
      console.error("[API /me] Backend fetch error:", fetchError);
      
      // Check if it's a configuration error
      if (fetchError instanceof Error && fetchError.message.includes("NEXT_PUBLIC_API_BASE_URL")) {
        return NextResponse.json(
          {
            error: "CONFIGURATION_ERROR",
            message: "NEXT_PUBLIC_API_BASE_URL is not configured. Please set it in Cloudflare Pages environment variables.",
          },
          { status: 500 },
        );
      }
      
      // Network or other errors
      return NextResponse.json(
        {
          error: "BACKEND_CONNECTION_ERROR",
          message: "Failed to connect to backend API. Please check if the backend is running and NEXT_PUBLIC_API_BASE_URL is correct.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[API /me] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

