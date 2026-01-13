/**
 * Admin authentication utilities
 */

/**
 * Check if admin is authenticated
 */
export async function checkAdminAuth(): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/auth/check", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error("Error checking admin auth:", error);
    return false;
  }
}

/**
 * Admin login
 */
export async function adminLogin(password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error during admin login:", error);
    return false;
  }
}

/**
 * Admin logout
 */
export async function adminLogout(): Promise<void> {
  try {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error during admin logout:", error);
  }
}
