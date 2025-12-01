"use client";

import { createContext, useContext, ReactNode } from "react";

interface AppContextType {
  reponse?: string;
  businessProfile?: {
    nom_etablissement: string;
    ville: string;
    metier: string;
    ton_marque: string;
  } | null;
  onCopy?: () => void;
  onRegenerate?: () => void;
  getInitials?: (name: string) => string;
}

const AppContext = createContext<AppContextType>({});

export function AppProvider({ children, ...props }: { children: ReactNode } & AppContextType) {
  return <AppContext.Provider value={props}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

