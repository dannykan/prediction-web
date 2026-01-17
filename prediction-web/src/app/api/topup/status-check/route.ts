/**
 * GET /api/topup/status-check
 * Check topup feature status
 * Calls backend GET /topup/status-check endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    // Check if API base URL is configured
    let apiBaseUrl: string;
    try {
      apiBaseUrl = getApiBaseUrl();
    } catch (error) {
      console.error("[API /topup/status-check] Missing NEXT_PUBLIC_API_BASE_URL:", error);
      // Return default disabled state if API URL is not configured
      return NextResponse.json({
        enabled: false,
        status: "pending",
        message: "储值功能配置中",
      });
    }

    // Call backend GET /topup/status-check endpoint
    try {
      const response = await fetch(`${apiBaseUrl}/topup/status-check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend returns 404, it means endpoint doesn't exist yet
      if (response.status === 404) {
        return NextResponse.json({
          enabled: false,
          status: "pending",
          message: "储值功能审核中，敬请期待",
        });
      }

      // Other errors - return disabled state
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      console.error("[API /topup/status-check] Backend error:", errorData);
      
      return NextResponse.json({
        enabled: false,
        status: "pending",
        message: "储值功能审核中，敬请期待",
      });
    } catch (fetchError) {
      // Network error or other fetch issues
      console.error("[API /topup/status-check] Backend fetch error:", fetchError);
      
      // Return disabled state on network errors
      return NextResponse.json({
        enabled: false,
        status: "pending",
        message: "储值功能审核中，敬请期待",
      });
    }
  } catch (error) {
    console.error("[API /topup/status-check] Error:", error);
    return NextResponse.json(
      {
        enabled: false,
        status: "pending",
        message: "储值功能审核中，敬请期待",
      },
      { status: 200 }, // Return 200 to avoid breaking UI
    );
  }
}
