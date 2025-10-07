import type { Project } from "@/entities/project";

// Специфичные типы для фичи списка проектов
export interface ProjectListFilters {
  search?: string;
  status?: string;
}

export interface ProjectListState {
  projects: Project[]; // Используем типы из entities
  isLoading: boolean;
  error: string | null;
  filters: ProjectListFilters;
  hasMore: boolean;
}
