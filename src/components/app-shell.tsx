"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (isPublicRoute) {
    return children;
  }

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-950">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[260px_1fr]">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex min-h-dvh min-w-0 flex-col lg:min-h-screen">
          <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="min-h-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
