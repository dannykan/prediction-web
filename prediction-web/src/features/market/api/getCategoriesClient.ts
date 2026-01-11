/**
 * Get categories (client-side)
 */

export interface Category {
  id: string;
  name: string;
  iconUrl?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getCategoriesClient(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const categories: Category[] = await response.json();

    // Sort by sortOrder if available, otherwise by name
    return categories.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("[getCategoriesClient] Failed to fetch categories:", error);
    return [];
  }
}

