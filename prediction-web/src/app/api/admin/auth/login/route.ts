/**
 * POST /api/admin/auth/login
 * Admin password login
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// TODO: 在生產環境中，應該從環境變量讀取，並使用安全的密碼哈希
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pgadmin2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // 驗證密碼
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // 設置 admin session cookie
    // 使用 httpOnly 和 secure 標誌保護 cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 小時
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /api/admin/auth/login] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
