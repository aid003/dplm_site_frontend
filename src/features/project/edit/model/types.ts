// Специфичные типы для фичи редактирования проекта
export interface ProjectEditFormData {
  name: string;
  description: string;
  projectFile: File | null;
}

export interface ProjectEditState {
  isSubmitting: boolean;
  error: string | null;
}
