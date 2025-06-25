// src/app/provider/theme-provider.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import themesData from "@/lib/themes.json";
import type { Theme, ThemeName, ThemeMode } from "@/types/theme.ts";

interface ThemeProviderState {
  theme: ThemeName;
  mode: ThemeMode;
  themes: Theme[];
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  isMounted: boolean;
}

const initialState: ThemeProviderState = {
  theme: "modern-minimal",
  mode: "light",
  themes: themesData.items,
  setTheme: () => null,
  setMode: () => null,
  isMounted: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("modern-minimal");
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [isMounted, setIsMounted] = useState(false);

  // This effect runs once on the client to sync React's state with what the
  // ThemeScript and localStorage have already set.
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeName;
    const storedMode = localStorage.getItem("theme-mode") as ThemeMode;

    if (storedTheme && themesData.items.some(t => t.name === storedTheme)) {
      setThemeState(storedTheme);
    }

    if (storedMode) {
      setModeState(storedMode);
    } else {
      const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
      if (userMedia.matches) {
        setModeState("dark");
      }
    }
    
    setIsMounted(true);
  }, []);

  // This effect applies styles and persists choices whenever they change.
  // It works hand-in-hand with the ThemeScript for a flash-free experience.
  useEffect(() => {
    if (!isMounted) return;

    const root = window.document.documentElement;
    const selectedTheme = themesData.items.find((t) => t.name === theme);
    
    if (!selectedTheme) {
      console.error(`Theme "${theme}" not found! Reverting to default.`);
      setThemeState("modern-minimal"); // Revert to a safe default
      return; 
    }

    root.classList.remove("light", "dark");
    root.classList.add(mode);
    
    const activeCssVars = {
      ...selectedTheme.cssVars.theme,
      ...selectedTheme.cssVars[mode],
    };

    for (const [key, value] of Object.entries(activeCssVars)) {
      root.style.setProperty(`--${key}`, value);
    }

    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-mode", mode);
  }, [theme, mode, isMounted]);

  // NEW: Create a custom setTheme function to add toast notifications
  const setTheme = (newThemeName: ThemeName) => {
    const themeTitle = themesData.items.find(t => t.name === newThemeName)?.title || newThemeName;
    toast.success(`Theme set to ${themeTitle}`);
    setThemeState(newThemeName);
  };

  const value = {
    theme,
    mode,
    themes: themesData.items,
    setTheme, // <-- Pass our new function instead of the raw state setter
    setMode: setModeState,
    isMounted,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};