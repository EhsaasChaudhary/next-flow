// src/types/theme.ts
import themesData from "@/lib/themes.json";

// The full theme object structure
export type Theme = (typeof themesData.items)[0];

// The "name" identifier for a theme (e.g., "modern-minimal")
export type ThemeName = Theme["name"];

// The available modes
export type ThemeMode = "light" | "dark";