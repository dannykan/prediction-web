/**
 * Upload avatar API function
 * Calls BFF /api/uploads/avatar
 */

export interface UploadAvatarResponse {
  url: string;
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/avatar", {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, browser will set it with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
  }

  const data: UploadAvatarResponse = await response.json();
  return data.url;
}
