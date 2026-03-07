"use client"

import { useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"
import type { Theme } from "@/types/resume"

type FontSize = "small" | "medium" | "large"

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = (localStorage.getItem("theme") || "dark") as Theme
      const savedFont = (localStorage.getItem("fontSize") || "medium") as FontSize

      const validThemes = ["dark", "light", "high-contrast", "monokai"]
      document.documentElement.className = document.documentElement.className
        .split(" ")
        .filter((cls) => !validThemes.includes(cls))
        .concat(savedTheme)
        .join(" ")

      // Apply font size with requestAnimationFrame for better performance
      const sizeMap: Record<FontSize, string> = { small: "14px", medium: "16px", large: "18px" }
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--base-font-size", sizeMap[savedFont])
      })

      setMounted(true)
    }

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") || "dark"
      const validThemes = ["dark", "light", "high-contrast", "monokai"]

      // Force update document class
      requestAnimationFrame(() => {
        document.documentElement.className = document.documentElement.className
          .split(" ")
          .filter((cls) => !validThemes.includes(cls))
          .concat(currentTheme)
          .join(" ")
      })
    }

    // Listen for storage changes to sync theme across tabs
    window.addEventListener("storage", handleThemeChange)

    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initializeTheme)
    } else {
      setTimeout(initializeTheme, 0)
    }

    return () => {
      window.removeEventListener("storage", handleThemeChange)
    }
  }, [])

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  )
}
