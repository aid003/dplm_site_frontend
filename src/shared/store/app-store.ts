"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

export type AppState = {
  theme: ThemeMode;
  sidebarOpen: boolean;
};

export type AppActions = {
  setTheme: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
};

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  theme: "dark",
  sidebarOpen: true,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setTheme: (mode) => set({ theme: mode }, false, "setTheme"),
        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),
        setSidebar: (open) => set({ sidebarOpen: open }, false, "setSidebar"),
      }),
      {
        name: "app-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
        version: 1,
      }
    ),
    { name: "app" }
  )
);

// Typed selectors
export const useAppSelector = <TSelected>(
  selector: (state: AppStore) => TSelected
): TSelected => useAppStore(selector);

// Shallow compare selector for objects to minimize re-renders
import { useShallow } from "zustand/react/shallow";
export const useAppShallow = <TSelected>(
  selector: (state: AppStore) => TSelected
): TSelected => useAppStore(useShallow(selector));

// Convenient actions hook
export const useAppActions = (): AppActions => {
  const { setTheme, toggleSidebar, setSidebar } = useAppStore.getState();
  return { setTheme, toggleSidebar, setSidebar };
};
