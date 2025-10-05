import type { ReactNode } from "react";

import { SessionGuard } from "@/entities/session/ui/session-guard";
import { AppSidebar } from "@/widgets/sidebar";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionGuard
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center text-sm text-muted-foreground">
          Загружаем рабочую область...
        </div>
      }
    >
      <AppSidebar>{children}</AppSidebar>
    </SessionGuard>
  );
}
