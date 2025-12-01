"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { RightPanelGenerate } from "./right-panel/RightPanelGenerate";
import { RightPanelHistory } from "./right-panel/RightPanelHistory";
import { RightPanelBusinessProfile } from "./right-panel/RightPanelBusinessProfile";
import { RightPanelBilling } from "./right-panel/RightPanelBilling";
import { RightPanelEmail } from "./right-panel/RightPanelEmail";
import { RightPanelValider } from "./right-panel/RightPanelValider";
import { RightPanelDefault } from "./right-panel/RightPanelDefault";

interface RightPanelProps {
  children?: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  const pathname = usePathname();

  // Si des children sont fournis explicitement, on les affiche
  if (children) {
    return <aside className="space-y-6">{children}</aside>;
  }

  // Memoizer le panneau selon la route pour éviter les re-renders inutiles
  const panel = useMemo(() => {
    if (!pathname) return null;

    if (pathname.includes("/valider")) {
      return <RightPanelValider />;
    }

    if (pathname === "/app" || pathname === "/app/") {
      return <RightPanelGenerate />;
    }

    if (pathname.includes("/historique") || pathname.includes("/history")) {
      return <RightPanelHistory />;
    }

    if (pathname.includes("/profil") || pathname.includes("/profile")) {
      return <RightPanelBusinessProfile />;
    }

    if (pathname.includes("/facturation") || pathname.includes("/billing")) {
      return <RightPanelBilling />;
    }

    if (pathname.includes("/email")) {
      return <RightPanelEmail />;
    }

    return <RightPanelDefault />;
  }, [pathname]);

  if (!panel) return null;

  return <aside className="space-y-6">{panel}</aside>;
}

