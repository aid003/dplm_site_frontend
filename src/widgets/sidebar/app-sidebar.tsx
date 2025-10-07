"use client";

import { SignOutButton } from "@/features/auth/sign-out";
import { TypedLink } from "@/shared/ui/components/typed-link";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChevronDown,
  Code2,
  Database,
  FolderKanban,
  History,
  Home,
  Plus,
  Settings,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/components/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/shared/ui/components/sidebar";
import { ROUTES } from "@/shared/lib/routes";

type AppSidebarProps = {
  children: React.ReactNode;
};

export function AppSidebar({ children }: AppSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = React.useState<string[]>(["main", "tools"]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const headerTitle = React.useMemo(() => {
    switch (pathname) {
      case ROUTES.home.pattern:
        return "Главная";
      case ROUTES.project.pattern:
        return "Проект";
      case ROUTES.projectCreate.pattern:
        return "Создать проект";
      case ROUTES.codeAnalysis.pattern:
        return "Анализ кода";
      case ROUTES.docs.pattern:
        return "Документация";
      case ROUTES.settings.pattern:
        return "Настройки";
      default:
        return "";
    }
  }, [pathname]);

  return (
    <SidebarProvider
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="group-data-[collapsible=icon]:pt-9">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {/* Первая группа элементов */}
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleContent>
                    <SidebarMenu className="gap-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="gap-3 text-sm [&>span]:font-normal [&>svg]:size-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                        >
                          <TypedLink route="home">
                            <Home
                              className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                              aria-hidden="true"
                            />
                            <span>Главная</span>
                          </TypedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="gap-3 text-sm [&>span]:font-normal [&>svg]:size-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                        >
                          <TypedLink route="project">
                            <FolderKanban
                              className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                              aria-hidden="true"
                            />
                            <span>Проект</span>
                          </TypedLink>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                              <Plus className="size-4" />
                              <span className="sr-only">Создать проект</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-[--radix-popper-anchor-width]"
                          >
                            <DropdownMenuItem asChild>
                              <TypedLink route="projectCreate">
                                <Plus className="mr-2 size-4" />
                                Создать проект
                              </TypedLink>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>

                {/* Вторая группа элементов */}
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleContent>
                    <SidebarMenu className="gap-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="gap-3 text-sm [&>span]:font-normal [&>svg]:size-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                        >
                          <TypedLink route="codeAnalysis">
                            <Code2
                              className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                              aria-hidden="true"
                            />
                            <span>Анализ кода</span>
                          </TypedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="gap-3 text-sm [&>span]:font-normal [&>svg]:size-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                        >
                          <TypedLink route="docs">
                            <BookOpenText
                              className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                              aria-hidden="true"
                            />
                            <span>Документация</span>
                          </TypedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="gap-3 text-sm [&>span]:font-normal [&>svg]:size-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                        >
                          <TypedLink route="settings">
                            <Settings
                              className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                              aria-hidden="true"
                            />
                            <span>Настройки</span>
                          </TypedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter className="p-4">
          <SignOutButton />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-12 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="relative z-30" />
          <div className="text-sm text-muted-foreground">{headerTitle}</div>
        </div>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
