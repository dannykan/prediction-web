/**
 * PATCH /api/admin/bots/[id]/recover - Recover a bot from error status
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const { id } = await params;

    const response = await fetch(`${apiBaseUrl}/admin/bots/${id}/recover`, {
      method: "PATCH",
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
    console.error("[API /api/admin/bots/[id]/recover] Error:", error);
    return NextResponse.json(
      { error: "Failed to recover bot" },
      { status: 500 }
    );
  }
}
