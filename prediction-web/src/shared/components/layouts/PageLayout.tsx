"use client";

import { Sidebar } from "./Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * Unified page layout component that ensures consistent layout across all pages
 * - Sidebar on the left (fixed)
 * - Main content area on the right (with proper margin-left to account for sidebar)
 * - Same layout structure as home page
 */
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex gap-0 h-full">
      {/* Sidebar - fixed on left, separate block */}
      <Sidebar />

      {/* Main Content Area - separate block */}
      {/* On desktop: ml-64 to account for fixed sidebar (16rem = 64 * 4px = 256px) */}
      {/* On mobile: pt-[64px] to account for sticky Navbar */}
      <div className="flex-1 min-w-0 md:ml-64 px-4 py-4 md:px-6 md:py-8 pt-[64px] md:pt-0">
        {children}
      </div>
    </div>
  );
}

