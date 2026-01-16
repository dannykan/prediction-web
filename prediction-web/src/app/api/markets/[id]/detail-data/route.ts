import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/core/api/getApiBaseUrl';

/**
 * GET /api/markets/[id]/detail-data
 * Proxy to backend aggregated market detail data endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiBaseUrl = getApiBaseUrl();
    
    // Get auth cookie from request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${apiBaseUrl}/markets/${encodeURIComponent(id)}/detail-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[markets/[id]/detail-data] Backend error: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch market detail data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[markets/[id]/detail-data] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
