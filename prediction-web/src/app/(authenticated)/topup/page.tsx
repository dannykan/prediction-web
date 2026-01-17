"use client";

import { TopupUIClient } from "@/components/figma/topup/TopupUIClient";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

export default function TopupPage() {
  return <TopupUIClient />;
}
