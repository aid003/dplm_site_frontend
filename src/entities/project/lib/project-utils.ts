import type { Project, ProjectStatus } from "../model/types";

export function formatProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case 'active':
      return 'Активный';
    case 'archived':
      return 'Архивирован';
    case 'deleted':
      return 'Удалён';
    default:
      return status;
  }
}

export function getProjectDisplayName(project: Project): string {
  return project.name || 'Без названия';
}

export function isProjectActive(project: Project): boolean {
  return project.status === 'active';
}

export function canEditProject(project: Project): boolean {
  return project.status !== 'deleted';
}

export function canDeleteProject(project: Project): boolean {
  return project.status === 'active';
}

export function validateProjectName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Название проекта обязательно' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Название должно содержать минимум 2 символа' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Название не должно превышать 100 символов' };
  }

  return { isValid: true };
}

export function validateProjectDescription(description: string): { isValid: boolean; error?: string } {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Описание не должно превышать 500 символов' };
  }

  return { isValid: true };
}

export function validateProjectFile(file: File | null): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: 'Файл проекта обязателен' };

  const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Разрешены только файлы .zip и .rar' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Размер файла не должен превышать 100MB' };
  }

  return { isValid: true };
}
