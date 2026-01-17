"use client";

import { Navbar } from "@/shared/components/layouts/Navbar";
import { ConditionalLayout } from "./ConditionalLayout";
import { SidebarProvider } from "@/components/figma/SidebarProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ConditionalLayout
        oldLayout={
          <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar - separate block in desktop, sticky overlay in mobile */}
            <Navbar />
            {/* Main content area - separate block below Navbar */}
            <main className="flex-1 pb-20 md:pb-8">{children}</main>
          </div>
        }
      >
        {children}
      </ConditionalLayout>
    </SidebarProvider>
  );
}
