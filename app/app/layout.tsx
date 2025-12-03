import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanelWrapper } from "@/components/RightPanelWrapper";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { AppFooter } from "@/components/AppFooter";
import type { ReactNode } from "react";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/sign-in");
    }

    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
            <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col min-h-0">
              <LayoutContent>{children}</LayoutContent>
            </div>
            <AppFooter />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in AppLayout:", error);
    redirect("/sign-in");
  }
}
