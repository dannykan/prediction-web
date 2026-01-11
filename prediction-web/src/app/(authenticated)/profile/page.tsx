"use client";

import { ProfileUIClient } from "@/components/figma/ProfileUIClient";

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return <ProfileUIClient />;
}
