import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/core/api/getApiBaseUrl';
import { getAuthTokenFromRequest } from '@/core/auth/cookies';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}/users/${userId}/asset-snapshots/record`;

    const token = await getAuthTokenFromRequest(request);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to record asset snapshot');
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[asset-snapshots/record] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}