import { NextRequest, NextResponse } from 'next/server';
import { getMeServer } from '@/features/user/api/getMeServer';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    // Get current user for authentication
    const user = await getMeServer();
    const userId = user?.id;

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (filter) queryParams.append('filter', filter);
    if (search) queryParams.append('search', search);
    if (categoryId) queryParams.append('categoryId', categoryId);

    // Get auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;

    // Fetch from backend
    const response = await fetch(`${apiBaseUrl}/markets/home-data?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Cookie': `authToken=${authToken}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] /api/markets/home-data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}
