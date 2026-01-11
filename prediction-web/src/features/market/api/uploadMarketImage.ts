/**
 * Upload market image API function
 * Calls BFF /api/uploads/market-image
 */

export interface UploadMarketImageResponse {
  url: string;
}

export async function uploadMarketImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/market-image", {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, browser will set it with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
  }

  const data: UploadMarketImageResponse = await response.json();
  return data.url;
}



