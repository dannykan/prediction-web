/**
 * GET /api/admin/users/[userId] - Get user details
 * PATCH /api/admin/users/[userId] - Update user
 * DELETE /api/admin/users/[userId] - Delete user
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const apiBaseUrl = getApiBaseUrl();

    // Backend /users/:id API doesn't require authentication
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("[API /api/admin/users/[userId] GET] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    // Backend /users/:id PATCH may not require authentication
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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
    console.error("[API /api/admin/users/[userId] PATCH] Error:", error);
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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const apiBaseUrl = getApiBaseUrl();

    // Check if request has a body (DELETE requests may not have one)
    let body: any = null;
    try {
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch (e) {
      // No body or invalid JSON, continue without body
      console.log("[API /api/admin/users/[userId] DELETE] No body in request");
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Authenticated": "true",
      },
    };

    // Only add body if it exists
    if (body !== null) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Backend /admin/users/:userId DELETE requires admin authentication
    const response = await fetch(`${apiBaseUrl}/admin/users/${userId}`, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Backend request failed" };
      }
      
      console.error(`[API /api/admin/users/[userId] DELETE] Backend error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      return NextResponse.json(errorData, { status: response.status });
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // No content or non-JSON response, return success
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error("[API /api/admin/users/[userId] DELETE] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
