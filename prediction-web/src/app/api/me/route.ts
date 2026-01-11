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

    // Try to call backend GET /me endpoint
    try {
      const response = await fetch(`${getApiBaseUrl()}/me`, {
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
      // Assume backend /me endpoint doesn't exist
      console.error("[API /me] Backend fetch error:", fetchError);
      return NextResponse.json(
        {
          error: "ME_ENDPOINT_NOT_IMPLEMENTED",
          message: "Backend /me endpoint is not implemented yet",
        },
        { status: 501 },
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

