/**
 * Upload Google avatar to Firebase Storage
 * Downloads the image from Google URL and uploads it to Firebase Storage
 */

import { uploadAvatar } from "@/features/user/api/uploadAvatar";

/**
 * Download image from URL and convert to File
 */
async function downloadImageAsFile(imageUrl: string, filename: string): Promise<File> {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    return file;
  } catch (error) {
    console.error('[uploadGoogleAvatar] Error downloading image:', error);
    throw error;
  }
}

/**
 * Upload Google avatar to Firebase Storage and update user avatar URL
 * @param googleAvatarUrl - Google avatar URL (e.g., from Google ID Token)
 * @returns Firebase Storage URL of the uploaded avatar
 */
export async function uploadGoogleAvatar(googleAvatarUrl: string): Promise<string> {
  try {
    console.log('[uploadGoogleAvatar] Starting Google avatar upload:', googleAvatarUrl);
    
    // Generate a filename based on timestamp
    const timestamp = Date.now();
    const filename = `google-avatar-${timestamp}.jpg`;
    
    // Download the image from Google URL
    const imageFile = await downloadImageAsFile(googleAvatarUrl, filename);
    console.log('[uploadGoogleAvatar] Image downloaded, size:', imageFile.size);
    
    // Upload to Firebase Storage via API
    const firebaseStorageUrl = await uploadAvatar(imageFile);
    console.log('[uploadGoogleAvatar] Avatar uploaded to Firebase Storage:', firebaseStorageUrl);
    
    return firebaseStorageUrl;
  } catch (error) {
    console.error('[uploadGoogleAvatar] Failed to upload Google avatar:', error);
    throw error;
  }
}

/**
 * Update user avatar URL via API
 * @param userId - User ID
 * @param avatarUrl - New avatar URL (Firebase Storage URL)
 */
export async function updateUserAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        avatarUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(errorData.message || `Failed to update avatar URL: ${response.statusText}`);
    }

    console.log('[updateUserAvatarUrl] Avatar URL updated successfully:', avatarUrl);
  } catch (error) {
    console.error('[updateUserAvatarUrl] Failed to update avatar URL:', error);
    throw error;
  }
}
