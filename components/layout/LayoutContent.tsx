"use client";

import { usePathname } from "next/navigation";
import { RightPanelWrapper } from "@/components/RightPanelWrapper";
import type { ReactNode } from "react";

export function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFacturationPage = pathname?.includes("/facturation") || pathname?.includes("/billing");

  if (isFacturationPage) {
    return (
      <section className="flex flex-col min-h-0 h-full flex-1">
        {children}
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6 flex-1 min-h-0">
      <section className="flex flex-col min-h-0 h-full">{children}</section>
      <aside className="lg:col-span-1">
        <RightPanelWrapper />
      </aside>
    </div>
  );
}

