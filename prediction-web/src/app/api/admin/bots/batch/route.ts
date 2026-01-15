/**
 * POST /api/admin/bots/batch - Batch create bots
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    const response = await fetch(`${apiBaseUrl}/admin/bots/batch`, {
      method: "POST",
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
    console.error("[API /api/admin/bots/batch] Error:", error);
    return NextResponse.json(
      { error: "Failed to batch create bots" },
      { status: 500 }
    );
  }
}
