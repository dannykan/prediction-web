"use client";

import { useEffect, useState, Children, isValidElement, cloneElement } from "react";
import { getMe } from "@/features/user/api/getMe";
import { clientFetch } from "@/core/api/client";

interface MarketDetailClientProps {
  marketId: string;
  children: React.ReactNode;
}

/**
 * Client component wrapper that fetches user info and passes it to children
 * This allows server components to render SEO-friendly content while
 * client components can access user-specific data
 */
export function MarketDetailClient({ marketId, children }: MarketDetailClientProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe();
        setUserId(user?.id);
      } catch (error) {
        // User not logged in, that's fine
        setUserId(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  // Clone children and pass userId as prop if they accept it
  return (
    <>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { userId, loading } as any);
        }
        return child;
      })}
    </>
  );
}

