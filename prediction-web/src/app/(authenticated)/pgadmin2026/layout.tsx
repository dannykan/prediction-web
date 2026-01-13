"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 登入頁面不需要保護
  if (pathname?.endsWith("/login")) {
    return <>{children}</>;
  }
  
  // 其他頁面需要保護
  return <AdminGuard>{children}</AdminGuard>;
}
