/**
 * Get asset snapshots for chart display
 */

export interface AssetSnapshot {
  date: string;
  coinBalance: number;
  positionsValue: number;
  totalAssets: number;
}

/**
 * Get asset snapshots for a user
 * @param userId User ID
 * @param startDate Optional start date (ISO string)
 * @param endDate Optional end date (ISO string)
 */
export async function getAssetSnapshots(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<AssetSnapshot[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const queryString = queryParams.toString();
  const url = `/api/users/${userId}/asset-snapshots${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset snapshots: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[getAssetSnapshots] Failed to fetch asset snapshots:', error);
    return [];
  }
}

/**
 * Record current asset snapshot
 * @param userId User ID
 */
export async function recordAssetSnapshot(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/users/${userId}/asset-snapshots/record`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to record asset snapshot: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('[recordAssetSnapshot] Failed to record asset snapshot:', error);
    // Don't throw - this is a non-critical operation
  }
}
