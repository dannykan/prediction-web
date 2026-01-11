/**
 * POST /api/auth/logout
 * Logout and clear authentication cookie
 */

import { NextResponse } from "next/server";
import { clearAuthToken } from "@/core/auth/cookies";


import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";export async function POST() {
  try {
    await clearAuthToken();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API /auth/logout] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}



