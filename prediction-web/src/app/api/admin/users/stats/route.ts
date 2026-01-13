/**
 * GET /api/admin/users/stats
 * Get user statistics including total count, 24h new users, and daily registration chart data
 * 
 * Note: Admin API routes don't require user authentication token (pg_token)
 * because backend APIs may not require authentication.
 * Admin access is already protected by admin_session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/core/api/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    // Fetch all users to calculate statistics
    // Note: In production, you might want to add a dedicated stats endpoint in the backend
    const response = await fetch(`${apiBaseUrl}/users?limit=10000`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Backend request failed",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    const users = Array.isArray(data) ? data : (data.users || []);
    
    // Calculate statistics
    const totalUsers = users.length;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Count users created in last 24 hours
    const newUsers24h = users.filter((user: any) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= twentyFourHoursAgo;
    }).length;
    
    // Generate daily registration chart data for last 30 days
    const chartData: { date: string; count: number; total: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Count new users on this day
      const count = users.filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;
      
      // Calculate total users up to and including this date
      const total = users.filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        return createdAt < nextDate;
      }).length;
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        count: Number(count),
        total: Number(total),
      });
    }
    
    return NextResponse.json({
      totalUsers,
      newUsers24h,
      chartData,
    });
  } catch (error) {
    console.error("[API /api/admin/users/stats] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
