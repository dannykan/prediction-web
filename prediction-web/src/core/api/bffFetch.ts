/**
 * BFF (Backend for Frontend) fetch utility
 * Automatically adds Bearer token from cookie to requests
 */

import { getAuthToken } from "@/core/auth/cookies";
import { getApiBaseUrl } from "./getApiBaseUrl";

interface BffFetchOptions extends Omit<RequestInit, "body"> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown; // Will be JSON stringified if object
}

/**
 * BFF fetch wrapper that automatically adds Bearer token
 * @param path - API endpoint path (relative to API_BASE_URL)
 * @param options - Fetch options
 * @returns Response
 */
export async function bffFetch(
  path: string,
  options: BffFetchOptions = {},
): Promise<Response> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  const { method = "GET", body, headers = {}, ...restOptions } = options;

  // Construct full URL
  const API_BASE_URL = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...headers,
  };

  // Prepare body
  let requestBody: string | undefined;
  if (body !== undefined) {
    if (typeof body === "string") {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
    }
  }

  // Make request
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    ...restOptions,
  });

  return response;
}

/**
 * BFF fetch with JSON parsing
 */
export async function bffFetchJson<T = unknown>(
  path: string,
  options: BffFetchOptions = {},
): Promise<T> {
  const response = await bffFetch(path, options);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  return response.json();
}

