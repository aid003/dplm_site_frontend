import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi, type SignInPayload } from "@/entities/session/api";
import { sessionQueryKeys } from "@/entities/session/lib/session-query-keys";
import { useSessionActions } from "@/entities/session";

export function useSignInMutation() {
  const queryClient = useQueryClient();
  const { setSession } = useSessionActions();

  return useMutation({
    mutationFn: (payload: SignInPayload) => authApi.signIn(payload),
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(sessionQueryKeys.current(), session);
      // Инвалидируем запрос сессии, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.current() });
    },
  });
}
