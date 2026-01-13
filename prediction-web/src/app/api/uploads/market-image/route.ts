import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function POST(request: NextRequest) {
  try {
    // Try to get token, but don't require it (admin uploads may not need user token)
    const token = await getAuthTokenFromRequest(request);
    
    // Check if this is an admin request (admin_session cookie)
    const adminSession = request.cookies.get("admin_session");
    const isAdminRequest = !!adminSession;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Forward to backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const headers: Record<string, string> = {
      // Don't set Content-Type, let fetch set it with boundary
    };

    // Only add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // If admin request, add admin header
    if (isAdminRequest) {
      headers["X-Admin-Authenticated"] = "true";
    }

    const response = await fetch(`${getApiBaseUrl()}/uploads/market-image`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/uploads/market-image] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

