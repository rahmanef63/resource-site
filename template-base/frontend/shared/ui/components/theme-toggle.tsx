"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Display-only — keep SSR/CSR markup identical until hydration completes.
  const display = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark";

  // Click reads the LIVE theme each time so the first click after hydration
  // (when the SSR snapshot was the placeholder) still flips the correct way.
  const toggle = () => {
    const actual = resolvedTheme ?? theme;
    setTheme(actual === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${display === "dark" ? "light" : "dark"} theme`}
      onClick={toggle}
      className={`flex items-center justify-center w-10 h-10 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors ${className}`}
    >
      {display === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
