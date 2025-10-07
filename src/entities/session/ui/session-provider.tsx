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
  const user = useSessionSelector((state) => state.user);
  const { setSession, setStatus, clearSession } = useSessionActions();

  const sessionQuery = useQuery({
    queryKey: sessionQueryKeys.current(),
    queryFn: authApi.session,
    enabled: status === "unknown",
    retry: (failureCount, error) => {
      // Не повторяем запрос при 401 ошибке (пользователь не аутентифицирован)
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionQuery.status === "success") {
      setSession(sessionQuery.data);
    }
    if (sessionQuery.status === "error") {
      // Если есть сохраненный пользователь, но сервер вернул ошибку,
      // значит сессия истекла - очищаем локальное хранилище
      if (user) {
        clearSession();
      } else {
        setStatus("unauthenticated");
      }
    }
  }, [sessionQuery.status, sessionQuery.data, setSession, setStatus, clearSession, user]);

  return <>{children}</>;
}
