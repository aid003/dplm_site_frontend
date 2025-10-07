import { ProjectAPI } from "@/entities/project";
import { validateProjectName, validateProjectDescription, validateProjectFile } from "@/entities/project";
import type { ProjectEditFormData } from "../model/types";
import type { UpdateProjectPayload } from "@/entities/project";

export function validateProjectEditForm(data: ProjectEditFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const nameValidation = validateProjectName(data.name);
  if (!nameValidation.isValid && nameValidation.error) {
    errors.name = nameValidation.error;
  }

  const descriptionValidation = validateProjectDescription(data.description);
  if (!descriptionValidation.isValid && descriptionValidation.error) {
    errors.description = descriptionValidation.error;
  }

  const fileValidation = validateProjectFile(data.projectFile);
  if (!fileValidation.isValid && fileValidation.error) {
    errors.projectFile = fileValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function transformEditFormDataToPayload(
  data: ProjectEditFormData,
  projectId: string
): UpdateProjectPayload {
  return {
    id: projectId,
    name: data.name.trim(),
    description: data.description.trim() || undefined,
    projectFile: data.projectFile || undefined,
  };
}

export async function updateProject(data: ProjectEditFormData, projectId: string): Promise<void> {
  const validation = validateProjectEditForm(data);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0] || 'Некорректные данные формы');
  }

  const payload = transformEditFormDataToPayload(data, projectId);
  await ProjectAPI.updateProject(payload);
}
