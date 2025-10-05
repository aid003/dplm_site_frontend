'use client'

import type { JSX } from "react"
import { useAppStore, useAppActions } from "@/shared/store"

const STORAGE_KEY = "theme"

export function ThemeToggle(): JSX.Element {
  const theme = useAppStore((s) => s.theme)
  const { setTheme } = useAppActions()

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark")
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  )
}


