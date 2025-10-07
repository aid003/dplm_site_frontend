import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PROJECT_QUERY_KEYS } from "@/shared/lib/query-keys/project-keys";
import { createProject } from "../lib/project-create-utils";
import type { ProjectCreateFormData } from "./types";

export function useProjectCreateMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ProjectCreateFormData>({
    mutationFn: async (formData: ProjectCreateFormData) => {
      await createProject(formData);
    },
    onSuccess: () => {
      // Инвалидируем кэш проектов для обновления списка
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
    },
  });
}
