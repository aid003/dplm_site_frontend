// Специфичные типы для фичи создания проекта
export interface ProjectCreateFormData {
  name: string;
  description: string;
  projectFile: File | null;
}

export interface ProjectCreateState {
  isSubmitting: boolean;
  error: string | null;
}
