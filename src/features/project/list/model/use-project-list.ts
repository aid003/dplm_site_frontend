import { useQuery } from "@tanstack/react-query";

import { ProjectAPI } from "@/entities/project";
import { PROJECT_QUERY_KEYS } from "@/shared/lib/query-keys/project-keys";
import type { ProjectFilters } from "@/entities/project";

export function useProjectList(filters?: ProjectFilters) {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(filters),
    queryFn: () => ProjectAPI.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => ProjectAPI.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
