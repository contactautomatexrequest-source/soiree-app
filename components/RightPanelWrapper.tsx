"use client";

import { usePathname } from "next/navigation";
import { RightPanel } from "./RightPanel";

export function RightPanelWrapper() {
  const pathname = usePathname();

  // Ne pas afficher le RightPanel sur la page facturation
  if (pathname?.includes("/facturation") || pathname?.includes("/billing")) {
    return null;
  }

  return <RightPanel />;
}
