import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi, type SignUpPayload } from "@/entities/session/api";
import { sessionQueryKeys } from "@/entities/session/lib/session-query-keys";
import { useSessionActions } from "@/entities/session";

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  const { setSession } = useSessionActions();

  return useMutation({
    mutationFn: (payload: SignUpPayload) => authApi.signUp(payload),
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(sessionQueryKeys.current(), session);
      // Инвалидируем запрос сессии, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.current() });
    },
  });
}
