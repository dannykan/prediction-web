import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/core/auth/cookies';
import { getApiBaseUrl } from '@/core/api/getApiBaseUrl';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Backend request failed',
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Feedback API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
