/**
 * POST /api/admin/categories - Create a new category
 * PATCH /api/admin/categories/reorder - Reorder categories
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const body = await request.json();

    // 驗證必填字段
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Name is required", message: "分類名稱不能為空" },
        { status: 400 }
      );
    }

    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json(
        { error: "Slug is required", message: "Slug 不能為空" },
        { status: 400 }
      );
    }

    console.log('[API /api/admin/categories POST] Request body:', body);

    const response = await fetch(`${apiBaseUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      console.error('[API /api/admin/categories POST] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[API /api/admin/categories POST] Success:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[API /api/admin/categories POST] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
        message: error instanceof Error ? error.message : "內部伺服器錯誤",
      },
      { status: 500 }
    );
  }
}
