import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/entities/session/api";
import { sessionQueryKeys } from "@/entities/session/lib/session-query-keys";
import { useSessionActions } from "@/entities/session";

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  const { clearSession } = useSessionActions();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: sessionQueryKeys.all(), exact: false });
    },
    onError: () => {
      // Даже если запрос на сервер не удался, очищаем локальную сессию
      clearSession();
      queryClient.removeQueries({ queryKey: sessionQueryKeys.all(), exact: false });
    },
  });
}
