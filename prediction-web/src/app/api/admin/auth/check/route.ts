/**
 * GET /api/admin/auth/check
 * Check if admin is authenticated
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");

    const isAuthenticated = adminSession?.value === "authenticated";

    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    console.error("[API /api/admin/auth/check] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
