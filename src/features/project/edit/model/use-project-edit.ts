import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PROJECT_QUERY_KEYS } from "@/shared/lib/query-keys/project-keys";
import { updateProject } from "../lib/project-edit-utils";
import type { ProjectEditFormData } from "./types";

export function useProjectEditMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ProjectEditFormData>({
    mutationFn: async (formData: ProjectEditFormData) => {
      await updateProject(formData, projectId);
    },
    onSuccess: () => {
      // Инвалидируем кэш проектов для обновления данных
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
      // Инвалидируем конкретный проект
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.detail(projectId) });
    },
  });
}
