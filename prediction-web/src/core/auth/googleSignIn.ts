/**
 * Google Sign In with Popup
 * Opens Google Sign In popup directly without redirecting to login page
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean; // Enable automatic sign-in
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentNotification?: (notification: { isNotDisplayed: boolean; isSkippedMoment: boolean; isDismissedMoment: boolean; reason: string }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: string | number;
              locale?: string;
            },
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Initialize Google Sign In with popup mode
 */
export async function initializeGoogleSignIn(): Promise<void> {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  }

  // Load Google Identity Services script if not already loaded
  if (!window.google?.accounts?.id) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }
}

/**
 * Silent sign-in with Google (automatic, no popup)
 * Uses One Tap to automatically sign in if user has previously authorized
 * @param onSuccess - Callback when login succeeds
 * @param onError - Callback when login fails
 */
export async function signInWithGoogleSilent(
  onSuccess?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  try {
    await initializeGoogleSignIn();

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    }

    return new Promise((resolve, reject) => {
      let callbackExecuted = false;

      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
          if (callbackExecuted) return; // Prevent duplicate calls
          callbackExecuted = true;

          try {
            console.log("[GoogleSignIn] Silent sign-in: Google ID Token received");
            
            // Send ID token to backend via BFF
            const loginResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                idToken: response.credential,
              }),
            });

            if (!loginResponse.ok) {
              const error = await loginResponse.json();
              console.error("[GoogleSignIn] Silent login failed:", error);
              const errorMessage = error.error || "未知錯誤";
              onError?.(errorMessage);
              reject(new Error(errorMessage));
              return;
            }

            const data = await loginResponse.json();
            console.log("[GoogleSignIn] Silent login successful:", {
              userId: data.user?.id,
              email: data.user?.email,
              isNewUser: data.isNewUser,
            });

            onSuccess?.();
            resolve();
          } catch (error) {
            console.error("[GoogleSignIn] Silent login error:", error);
            const errorMessage = error instanceof Error ? error.message : "未知錯誤";
            onError?.(errorMessage);
            reject(error);
          }
        },
        auto_select: true, // Enable automatic sign-in
        ux_mode: "popup",
      });

      // Trigger One Tap prompt (silent, automatic)
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed || notification.isSkippedMoment || notification.isDismissedMoment) {
          // One Tap was not displayed (user not signed in to Google, or dismissed)
          console.log("[GoogleSignIn] One Tap not displayed:", notification.reason);
          // Don't reject, just silently fail - user can use manual login
          if (!callbackExecuted) {
            const errorMsg = "自動登入不可用，請使用手動登入";
            onError?.(errorMsg);
            reject(new Error(errorMsg));
          }
        }
      });
    });
  } catch (error) {
    console.error("[GoogleSignIn] Failed to initialize silent sign-in:", error);
    const errorMessage = error instanceof Error ? error.message : "登入失敗";
    onError?.(errorMessage);
    throw error;
  }
}

/**
 * Sign in with Google using popup
 * @param onSuccess - Callback when login succeeds
 * @param onError - Callback when login fails
 */
export async function signInWithGooglePopup(
  onSuccess?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  try {
    await initializeGoogleSignIn();

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    }

    return new Promise((resolve, reject) => {
      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
          try {
            console.log("[GoogleSignIn] Google ID Token received");
            
            // Send ID token to backend via BFF
            const loginResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                idToken: response.credential,
              }),
            });

            if (!loginResponse.ok) {
              const error = await loginResponse.json();
              console.error("[GoogleSignIn] Login failed:", error);
              const errorMessage = error.error || "未知錯誤";
              onError?.(errorMessage);
              reject(new Error(errorMessage));
              return;
            }

            const data = await loginResponse.json();
            console.log("[GoogleSignIn] Login successful:", {
              userId: data.user?.id,
              email: data.user?.email,
              isNewUser: data.isNewUser,
            });

            onSuccess?.();
            resolve();
          } catch (error) {
            console.error("[GoogleSignIn] Login error:", error);
            const errorMessage = error instanceof Error ? error.message : "未知錯誤";
            onError?.(errorMessage);
            reject(error);
          }
        },
        ux_mode: "popup", // Use popup instead of redirect
      });

      // Trigger the popup by creating and clicking a button
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.top = "-1000px";
      tempDiv.style.left = "-1000px";
      document.body.appendChild(tempDiv);
      
      window.google!.accounts.id.renderButton(tempDiv, {
        theme: "outline",
        size: "large",
        text: "signin_with",
      });

      // Wait a bit for button to render, then click it
      setTimeout(() => {
        const button = tempDiv.querySelector("div[role='button']") as HTMLElement;
        if (button) {
          button.click();
          // Remove temp div after a delay
          setTimeout(() => {
            if (document.body.contains(tempDiv)) {
              document.body.removeChild(tempDiv);
            }
          }, 1000);
        } else {
          document.body.removeChild(tempDiv);
          const errorMsg = "無法顯示登入視窗，請重試";
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        }
      }, 100);
    });
  } catch (error) {
    console.error("[GoogleSignIn] Failed to initialize:", error);
    const errorMessage = error instanceof Error ? error.message : "登入失敗";
    onError?.(errorMessage);
    throw error;
  }
}

