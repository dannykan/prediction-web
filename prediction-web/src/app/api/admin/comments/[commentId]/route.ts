/**
 * PATCH /api/admin/comments/[commentId] - Edit a comment (Admin only)
 * DELETE /api/admin/comments/[commentId] - Delete a comment (Admin only)
 * Forward to backend PATCH/DELETE /admin/comments/:commentId
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const { commentId } = await params;
    const body = await request.json();

    // Backend /admin/comments/:commentId PATCH requires admin authentication
    const response = await fetch(`${apiBaseUrl}/admin/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
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
    console.error("[API /api/admin/comments/[commentId] PATCH] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const { commentId } = await params;
    const body = await request.json();

    // Backend /admin/comments/:commentId DELETE requires admin authentication
    const response = await fetch(`${apiBaseUrl}/admin/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
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
    console.error("[API /api/admin/comments/[commentId] DELETE] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
