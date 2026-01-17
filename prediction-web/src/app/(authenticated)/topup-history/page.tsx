"use client";

import { TopupHistoryUIClient } from "@/components/figma/topup/TopupHistoryUIClient";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

export default function TopupHistoryPage() {
  return <TopupHistoryUIClient />;
}
