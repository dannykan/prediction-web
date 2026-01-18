import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/core/api/getApiBaseUrl';

/**
 * POST /api/admin/tasks/recover-historical-snapshots
 * Recover historical asset snapshots from transaction history
 * Query params:
 * - userId (optional): specific user ID to recover
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    
    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}/admin/tasks/recover-historical-snapshots${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Authenticated': 'true', // Admin authentication header
      },
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
  } catch (error) {
    console.error('[API /api/admin/tasks/recover-historical-snapshots] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
