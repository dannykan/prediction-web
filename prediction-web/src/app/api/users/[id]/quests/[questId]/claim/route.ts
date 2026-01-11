/**
 * POST /api/users/[id]/quests/[questId]/claim
 * Forward to backend POST /users/:id/quests/:questId/claim
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questId: string }> },
) {
  try {
    const { id, questId } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!questId) {
      return NextResponse.json(
        { error: "Quest ID is required" },
        { status: 400 },
      );
    }

    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward to backend
    const backendUrl = `${getApiBaseUrl()}/users/${encodeURIComponent(id)}/quests/${encodeURIComponent(questId)}/claim`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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
    console.error("[API /api/users/[id]/quests/[questId]/claim] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
