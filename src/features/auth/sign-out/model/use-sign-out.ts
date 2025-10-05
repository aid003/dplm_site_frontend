import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/entities/session/api";
import { sessionQueryKeys } from "@/entities/session/lib/session-query-keys";
import { useSessionActions } from "@/entities/session";

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  const { clearSession, markUnknown } = useSessionActions();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onMutate: () => {
      markUnknown();
    },
    onSuccess: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: sessionQueryKeys.all(), exact: false });
    },
    onError: () => {
      clearSession();
    },
  });
}
