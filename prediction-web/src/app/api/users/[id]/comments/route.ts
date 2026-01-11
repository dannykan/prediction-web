import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


/**
 * GET /api/users/[id]/comments
 * Get user comments with pagination and search
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const search = searchParams.get('search') || '';
    const currentUserId = searchParams.get('currentUserId') || '';

    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = new URLSearchParams({
      page,
      limit,
    });
    if (search) {
      queryParams.append('search', search);
    }
    if (currentUserId) {
      queryParams.append('currentUserId', currentUserId);
    }

    const response = await fetch(`${getApiBaseUrl()}/users/${encodeURIComponent(id)}/comments?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[API /api/users/[id]/comments] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
