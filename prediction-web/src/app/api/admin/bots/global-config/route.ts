/**
 * GET /api/admin/bots/global-config - Get global bot configuration
 * PATCH /api/admin/bots/global-config - Update global bot configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();

    const response = await fetch(`${apiBaseUrl}/admin/bots/global-config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/bots/global-config] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch global config" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    const response = await fetch(`${apiBaseUrl}/admin/bots/global-config`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/bots/global-config] Error:", error);
    return NextResponse.json(
      { error: "Failed to update global config" },
      { status: 500 }
    );
  }
}
