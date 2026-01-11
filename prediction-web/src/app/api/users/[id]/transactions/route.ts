import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest } from "@/core/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

/**
 * GET /api/users/[id]/transactions
 * Get user transaction history
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

    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}/transactions`, {
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
    
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BFF /api/users/[id]/transactions] Received ${Array.isArray(data) ? data.length : 0} transactions`);
      const lmsrTrades = Array.isArray(data) ? data.filter((t: any) => 
        t.description?.includes("LMSR Trade:") || 
        t.description?.includes("Exclusive Market Trade:")
      ) : [];
      console.log(`[BFF /api/users/[id]/transactions] Found ${lmsrTrades.length} LMSR trades`);
      const withMarketInfo = Array.isArray(data) ? data.filter((t: any) => t.marketInfo) : [];
      console.log(`[BFF /api/users/[id]/transactions] ${withMarketInfo.length} transactions have marketInfo`);
      if (lmsrTrades.length > 0 && withMarketInfo.length < lmsrTrades.length) {
        console.warn(`[BFF /api/users/[id]/transactions] ⚠️ Some LMSR trades are missing marketInfo!`);
        lmsrTrades.forEach((t: any) => {
          if (!t.marketInfo) {
            console.warn(`[BFF /api/users/[id]/transactions] Missing marketInfo for transaction:`, {
              id: t.id,
              description: t.description,
              referenceId: t.referenceId,
            });
          }
        });
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[API /api/users/[id]/transactions] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

