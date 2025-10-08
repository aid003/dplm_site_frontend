"use client";

import { useState } from "react";
import { Plus, Search, Filter, Code2 } from "lucide-react";

import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { useProjectList } from "../model/use-project-list";
import { formatProjectStatus, getProjectDisplayName } from "@/entities/project";
import { TypedLink } from "@/shared/ui/components/typed-link";

export function ProjectList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useProjectList({ search: search || undefined });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Проекты</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Ошибка загрузки проектов: {error.message}</p>
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Проекты</h2>
        <TypedLink route="projectCreate">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать проект
          </Button>
        </TypedLink>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск проектов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {search ? "Проекты не найдены" : "У вас пока нет проектов"}
          </p>
          <TypedLink route="projectCreate">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать первый проект
            </Button>
          </TypedLink>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold truncate">{getProjectDisplayName(project)}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formatProjectStatus(project.status)}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.projectFile && (
                <p className="text-xs text-muted-foreground truncate">
                  Файл: {project.projectFile}
                </p>
              )}

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Создан: {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <TypedLink route="editor" params={{ projectId: project.id }}>
                    <Code2 className="w-4 h-4 mr-2" />
                    Редактировать
                  </TypedLink>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
