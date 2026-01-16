/**
 * GET /api/admin/bots/[id]/trading-history
 * Get bot user detailed trading history and asset changes
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const backendUrl = `${apiBaseUrl}/users/${encodeURIComponent(id)}/bot-trading-history`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/admin/bots/[id]/trading-history] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot trading history" },
      { status: 500 }
    );
  }
}
