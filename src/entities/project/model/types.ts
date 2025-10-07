export interface Project {
  id: string;
  name: string;
  description?: string;
  projectFile?: string; // URL загруженного файла или имя файла
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
}

export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  projectFile?: File; // Файл для загрузки
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  id: string;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  hasMore: boolean;
}

export interface ProjectResponse {
  project: Project;
}
