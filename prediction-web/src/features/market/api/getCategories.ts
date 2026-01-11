import { serverFetch } from "@/core/api/serverFetch";

/**
 * Category type from backend
 */
export interface Category {
  id: string;
  name: string;
  iconUrl?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all categories from Railway backend API
 * 
 * @param revalidate - ISR revalidation time in seconds (default: 60)
 * @returns Array of Category objects
 */
export async function getCategories(
  revalidate: number | false = 60,
): Promise<Category[]> {
  try {
    const categories = await serverFetch<Category[]>("/categories", {
      next: { revalidate },
    });

    // Sort by sortOrder if available, otherwise by name
    return categories.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("[getCategories] Failed to fetch categories:", error);
    // Return empty array on error (graceful degradation)
    return [];
  }
}



