"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSessionSelector } from "@/entities/session/model/session-store";
import { ROUTES } from "@/shared/lib/routes";

const DEFAULT_FALLBACK = (
  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
    Проверка доступа...
  </div>
);

type SessionGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function SessionGuard({ children, fallback = DEFAULT_FALLBACK }: SessionGuardProps) {
  const status = useSessionSelector((state) => state.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(ROUTES.authLogin.build());
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
