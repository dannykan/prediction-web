import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";


export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/categories] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}



