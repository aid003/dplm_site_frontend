"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useProjectEditMutation } from "../model/use-project-edit";
import { useProject } from "@/features/project/list";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { FileUpload } from "@/shared/ui/components/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/ui/components/form";
import { Loader2 } from "lucide-react";
import type { ProjectEditFormData } from "../model/types";

interface ProjectEditFormProps {
  projectId: string;
}

export function ProjectEditForm({ projectId }: ProjectEditFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { data: projectData, isLoading: isLoadingProject, error: projectError } = useProject(projectId);

  const form = useForm<ProjectEditFormData>({
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useProjectEditMutation(projectId);

  // Заполняем форму данными проекта при загрузке
  useEffect(() => {
    if (projectData?.project) {
      const { project } = projectData;
      form.reset({
        name: project.name,
        description: project.description || "",
        projectFile: null, // Файл не загружаем из API, пользователь должен выбрать новый
      });
    }
  }, [projectData, form]);

  const onSubmit = async (values: ProjectEditFormData) => {
    setServerError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Моковый прогресс загрузки для демонстрации
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await mutateAsync(values);

      // Завершаем прогресс
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Небольшая пауза перед редиректом
      setTimeout(() => {
        router.back();
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Не удалось обновить проект. Повторите попытку позже.");
      }
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Загрузка проекта...</span>
      </div>
    );
  }

  if (projectError || !projectData?.project) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          {projectError?.message || "Проект не найден"}
        </p>
      </div>
    );
  }

  const project = projectData.project;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Редактировать проект</h1>
        <p className="text-muted-foreground mt-2">
          Измените информацию о проекте &ldquo;{project.name}&rdquo;
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="name"
            rules={{
              required: "Укажите название проекта",
              minLength: {
                value: 2,
                message: "Название должно содержать минимум 2 символа",
              },
              maxLength: {
                value: 100,
                message: "Название не должно превышать 100 символов",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название проекта</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Мой проект"
                    disabled={isPending}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Укажите понятное название для вашего проекта.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            rules={{
              maxLength: {
                value: 500,
                message: "Описание не должно превышать 500 символов",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание (необязательно)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Краткое описание проекта"
                    disabled={isPending}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Поможет лучше понять назначение проекта.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="projectFile"
            rules={{
              required: "Файл проекта обязателен",
            }}
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>Файл проекта</FormLabel>
                <FormControl>
                  <FileUpload
                    selectedFile={value}
                    onFileSelect={onChange}
                    accept=".zip,.rar"
                    maxSize={100 * 1024 * 1024}
                    disabled={isPending || isUploading}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                  />
                </FormControl>
                <FormDescription>
                  Загрузите архив проекта в формате .zip или .rar (максимум 100MB). Файл обязателен.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{serverError}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || isUploading || !form.formState.isValid}
            >
              {isUploading ? `Загружаем... ${uploadProgress}%` : isPending ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
