/**
 * POST /api/auth/login
 * Login with Google ID Token
 */

import { NextRequest, NextResponse } from "next/server";
import { setAuthToken } from "@/core/auth/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, accessToken } = body;

    // Validate that at least one token is provided
    if (!idToken && !accessToken) {
      return NextResponse.json(
        { error: "Either idToken or accessToken is required" },
        { status: 400 },
      );
    }

    // Validate token types
    if (idToken && typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken must be a string" },
        { status: 400 },
      );
    }
    if (accessToken && typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "accessToken must be a string" },
        { status: 400 },
      );
    }

    // Prepare payload for backend
    const backendPayload: {
      provider: string;
      idToken?: string;
      accessToken?: string;
    } = {
      provider: "google",
    };

    if (idToken) {
      backendPayload.idToken = idToken;
    }
    if (accessToken) {
      backendPayload.accessToken = accessToken;
    }

    // Forward to backend
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward error from backend
      return NextResponse.json(
        {
          error: data.message || data.error || "Login failed",
          statusCode: response.status,
        },
        { status: response.status },
      );
    }

    // Set httpOnly cookie with token (prefer idToken, fallback to accessToken)
    const tokenToStore = idToken || accessToken;
    if (!tokenToStore) {
      return NextResponse.json(
        { error: "No token to store" },
        { status: 500 },
      );
    }
    await setAuthToken(tokenToStore);

    // Return backend response (user, isNewUser)
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /auth/login] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

