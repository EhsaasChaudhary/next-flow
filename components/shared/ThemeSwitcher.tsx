"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon, Palette, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/app/provider/theme-provider";
import { cn } from "@/lib/utils";

type Theme = {
  name: string;
  title: string;
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export function ThemeSwitcher() {
  const { theme, setTheme, themes, mode, setMode, isMounted } = useTheme();

  if (!isMounted) {
    return <div className="h-9 w-[158px] animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="inline-flex h-9 items-center justify-center rounded-md border border-border/50 bg-background/50 p-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-7 items-center gap-2 rounded-sm px-3 text-sm transition-colors data-[state=open]:bg-muted/50 hover:bg-muted/50"
            aria-label="Select theme"
          >
            <Palette className="h-4 w-4" />
            <span>Theme Selector</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={cn(
            "z-50 mt-6 w-[90vw] max-w-lg rounded-xl border-border/50 bg-background/95 p-0 backdrop-blur-sm",
            "flex max-h-[80vh] flex-col"
          )}
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[length:1rem_1rem]"></div>
          <div className="shrink-0 border-b border-border/50 px-6 py-4">
            <h3 className="text-lg font-medium text-foreground">
              Customize Theme
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a color scheme for the interface.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {themes.map((t: Theme) => (
                <ThemePreviewButton
                  key={t.name}
                  themeOption={t}
                  currentTheme={theme}
                  currentMode={mode}
                  onSelect={() => setTheme(t.name as any)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mode Toggle Button */}
      <Button
        variant="ghost"
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
        className="flex h-7 items-center gap-2 rounded-sm px-3 text-sm capitalize transition-colors hover:bg-muted/50"
        aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
      >
        {mode === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span>{mode}</span>
      </Button>
    </div>
  );
}

function ThemePreviewButton({
  themeOption,
  currentTheme,
  currentMode,
  onSelect,
}: {
  themeOption: Theme;
  currentTheme: string;
  currentMode: "light" | "dark";
  onSelect: () => void;
}) {
  const themeVars = themeOption.cssVars[currentMode];
  const isActive = currentTheme === themeOption.name;

  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      className="h-auto w-full justify-start p-2.5 transition-all"
    >
      <div className="flex w-full items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 p-1 transition-colors"
          style={{
            backgroundColor: themeVars.background,
            borderColor: isActive ? themeVars.primary : "transparent",
          }}
        >
          <div className="flex h-full w-full gap-1">
            <div
              className="w-1/2 rounded-sm"
              style={{ backgroundColor: themeVars.primary }}
            />
            <div className="flex w-1/2 flex-col gap-1">
              <div
                className="h-1/2 w-full rounded-sm"
                style={{ backgroundColor: themeVars.secondary }}
              />
              <div
                className="h-1/2 w-full rounded-sm"
                style={{ backgroundColor: themeVars.accent }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold leading-tight text-foreground">
            {themeOption.title}
          </span>
          {isActive && <Check className="mt-1 h-3.5 w-3.5 text-primary" />}
        </div>
      </div>
    </Button>
  );
}
