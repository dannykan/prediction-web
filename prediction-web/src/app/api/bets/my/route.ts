/**
 * GET /api/bets/my
 * @deprecated Bet API is deprecated, using LMSR now. Returns empty array.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Bet API deprecated - using LMSR now, return empty array
  return NextResponse.json([]);
}

