"use client";

import { SignOutButton } from "@/features/auth/sign-out";
import { TypedLink } from "@/shared/ui/components/typed-link";
import * as React from "react";
import { usePathname } from "next/navigation";
import { BookOpenText, Code2, FolderKanban, Home, Settings } from "lucide-react";
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
  const navItems = React.useMemo(
    () =>
      [
        { route: "home", label: "Главная", icon: Home },
        { route: "project", label: "Проект", icon: FolderKanban },
        { route: "codeAnalysis", label: "Анализ кода", icon: Code2 },
        { route: "docs", label: "Документация", icon: BookOpenText },
        { route: "settings", label: "Настройки", icon: Settings },
      ] as const,
    []
  );
  const headerTitle = React.useMemo(() => {
    switch (pathname) {
      case ROUTES.home.pattern:
        return "Главная";
      case ROUTES.project.pattern:
        return "Проект";
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
            <SidebarGroupLabel>Навигация</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-3">
                {navItems.map(({ route, label, icon: Icon }) => (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton
                      asChild
                      className="gap-3 text-base [&>span]:font-normal [&>svg]:size-5 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:px-0"
                    >
                      <TypedLink route={route}>
                        <Icon
                          className="shrink-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
                          aria-hidden="true"
                          strokeWidth={1.5}
                        />
                        <span>{label}</span>
                      </TypedLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
