import { httpRequest } from "@/shared/api/http-client";
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectFilters,
  ProjectListResponse,
  ProjectResponse
} from "../model/types";

const PROJECTS_API_BASE = "/projects";

export class ProjectAPI {
  static async getProjects(filters?: ProjectFilters): Promise<ProjectListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `${PROJECTS_API_BASE}?${queryString}` : PROJECTS_API_BASE;

    return await httpRequest<ProjectListResponse>(url);
  }

  static async getProject(id: string): Promise<ProjectResponse> {
    return await httpRequest<ProjectResponse>(`${PROJECTS_API_BASE}/${id}`);
  }

  static async createProject(payload: CreateProjectPayload): Promise<ProjectResponse> {
    const formData = new FormData();

    formData.append('name', payload.name);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.projectFile) {
      formData.append('projectFile', payload.projectFile);
    }

    return await httpRequest<ProjectResponse>(PROJECTS_API_BASE, {
      method: "POST",
      body: formData,
    });
  }

  static async updateProject(payload: UpdateProjectPayload): Promise<ProjectResponse> {
    const { id, ...updateData } = payload;
    const formData = new FormData();

    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.description) formData.append('description', updateData.description);
    if (updateData.projectFile) formData.append('projectFile', updateData.projectFile);

    return await httpRequest<ProjectResponse>(`${PROJECTS_API_BASE}/${id}`, {
      method: "PATCH",
      body: formData,
    });
  }

  static async deleteProject(id: string): Promise<void> {
    await httpRequest(`${PROJECTS_API_BASE}/${id}`, {
      method: "DELETE",
    });
  }

  static async archiveProject(id: string): Promise<ProjectResponse> {
    return await httpRequest<ProjectResponse>(`${PROJECTS_API_BASE}/${id}/archive`, {
      method: "POST",
    });
  }

  static async restoreProject(id: string): Promise<ProjectResponse> {
    return await httpRequest<ProjectResponse>(`${PROJECTS_API_BASE}/${id}/restore`, {
      method: "POST",
    });
  }
}
