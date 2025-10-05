"use client";

import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/entities/session/api";
import { sessionQueryKeys } from "@/entities/session/lib/session-query-keys";
import { useSessionActions, useSessionSelector } from "@/entities/session/model/session-store";

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const status = useSessionSelector((state) => state.status);
  const { setSession, clearSession } = useSessionActions();

  const sessionQuery = useQuery({
    queryKey: sessionQueryKeys.current(),
    queryFn: authApi.session,
    enabled: status === "unknown",
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionQuery.status === "success") {
      setSession(sessionQuery.data);
    }
    if (sessionQuery.status === "error") {
      clearSession();
    }
  }, [sessionQuery.status, sessionQuery.data, setSession, clearSession]);

  return <>{children}</>;
}
