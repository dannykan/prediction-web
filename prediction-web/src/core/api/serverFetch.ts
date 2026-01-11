/**
 * Server-side fetch wrapper for Next.js API calls
 * Supports ISR revalidation and error handling
 */

interface ServerFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
  };
}

/**
 * Server-side fetch wrapper
 * @param url - API endpoint (relative or absolute)
 * @param options - Fetch options including Next.js revalidation
 * @returns Response data or null if error
 * @throws Error if response is not 2xx
 */
export async function serverFetch<T = unknown>(
  url: string,
  options?: ServerFetchOptions,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!baseUrl || baseUrl === 'https://example.com') {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL is not set or is using default value.\n` +
      `Please create a .env.local file in the project root with:\n` +
      `NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app\n\n` +
      `Current value: ${baseUrl || '(not set)'}`,
    );
  }

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Extract Next.js revalidation options
  const { next, ...fetchOptions } = options || {};
  
  // Build fetch options with Next.js cache control
  // Use 'as any' to allow Next.js-specific 'next' option
  const requestOptions: RequestInit & { next?: { revalidate?: number | false } } = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Add Next.js revalidation if specified
  if (next?.revalidate !== undefined) {
    if (next.revalidate === false) {
      requestOptions.cache = 'no-store';
    } else {
      // Next.js extends fetch with 'next' option
      (requestOptions as any).next = { revalidate: next.revalidate };
    }
  }

  const response = await fetch(fullUrl, requestOptions as RequestInit);

  // Handle non-2xx responses
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    
    // Check if response is HTML (likely wrong URL or 404 page)
    const isHtml = errorText.trim().toLowerCase().startsWith('<!doctype') || 
                   errorText.trim().toLowerCase().startsWith('<html');
    
    if (isHtml) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n` +
        `The URL "${fullUrl}" returned HTML instead of JSON.\n` +
        `This usually means:\n` +
        `1. NEXT_PUBLIC_API_BASE_URL is incorrect\n` +
        `2. The API endpoint does not exist\n` +
        `3. The backend server is not running\n\n` +
        `Please check your .env.local file and ensure NEXT_PUBLIC_API_BASE_URL is correct.\n` +
        `Current base URL: ${baseUrl}`,
      );
    }
    
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}\n` +
      `URL: ${fullUrl}\n` +
      `Response: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`,
    );
  }

  // Parse JSON response
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

