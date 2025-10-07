import { ProjectAPI } from "@/entities/project";
import { validateProjectName, validateProjectDescription, validateProjectFile } from "@/entities/project";
import type { ProjectCreateFormData } from "../model/types";
import type { CreateProjectPayload } from "@/entities/project";

export function validateProjectCreateForm(data: ProjectCreateFormData): {
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

export function transformFormDataToPayload(data: ProjectCreateFormData): CreateProjectPayload {
  return {
    name: data.name.trim(),
    description: data.description.trim() || undefined,
    projectFile: data.projectFile || undefined,
  };
}

export async function createProject(data: ProjectCreateFormData): Promise<void> {
  const validation = validateProjectCreateForm(data);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0] || 'Некорректные данные формы');
  }

  const payload = transformFormDataToPayload(data);
  await ProjectAPI.createProject(payload);
}
