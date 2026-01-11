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
          }) => void;
          prompt: () => void;
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

