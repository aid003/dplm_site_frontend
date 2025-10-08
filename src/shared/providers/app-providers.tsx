"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "./query-client-provider";
import { SessionProvider } from "@/entities/session/ui/session-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </QueryProvider>
  );
}
