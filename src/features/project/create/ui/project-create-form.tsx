"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useProjectCreateMutation } from "../model/use-project-create";
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
import { ROUTES } from "@/shared/lib/routes";
import type { ProjectCreateFormData } from "../model/types";

const DEFAULT_VALUES: ProjectCreateFormData = {
  name: "",
  description: "",
  projectFile: null as File | null,
};

export function ProjectCreateForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProjectCreateFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useProjectCreateMutation();

  const onSubmit = async (values: ProjectCreateFormData) => {
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
        router.push(ROUTES.project.build());
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Не удалось создать проект. Повторите попытку позже.");
      }
    }
  };

  return (
    <div className="space-y-6">
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
                  Загрузите архив проекта в формате .zip или .rar (максимум 100MB).
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
              {isUploading ? `Загружаем... ${uploadProgress}%` : isPending ? "Создаём..." : "Создать проект"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}