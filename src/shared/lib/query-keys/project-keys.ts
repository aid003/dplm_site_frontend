import type { ProjectFilters } from "@/entities/project";

export const PROJECT_QUERY_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_QUERY_KEYS.all, "list"] as const,
  list: (filters?: ProjectFilters) => [...PROJECT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PROJECT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PROJECT_QUERY_KEYS.details(), id] as const,
} as const;
