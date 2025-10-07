import { ProjectCreateForm } from "@/features/project/create";

export default function ProjectCreatePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Создать проект</h1>
          <p className="text-muted-foreground mt-2">
            Создайте новый проект для анализа кода и управления задачами разработки.
          </p>
        </div>
        <ProjectCreateForm />
      </div>
    </div>
  );
}
