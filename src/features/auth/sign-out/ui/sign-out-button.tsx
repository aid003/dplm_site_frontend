"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSignOutMutation } from "@/features/auth/sign-out/model/use-sign-out";
import { Button } from "@/shared/ui/components/button";
import { ROUTES } from "@/shared/lib/routes";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useSignOutMutation();

  const handleSignOut = async () => {
    setError(null);
    try {
      await mutateAsync();
      router.replace(ROUTES.authLogin.build());
    } catch {
      setError("Не удалось выйти. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={handleSignOut}
        disabled={isPending}
      >
        <LogOut className="h-4 w-4" /> Выйти
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
