"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Id } from "@convex/_generated/dataModel";

/**
 * ThemeContext - Simplified Version
 * 
 * NOTE: This is a simplified version that needs full Convex integration.
 * Currently uses local state for theme management.
 * 
 * TODO: Integrate with actual Convex settings API when ready
 * - Use useQuery(api.features.cmsLite.settings.queries.get)
 * - Apply theme colors from database settings
 */

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToOklch(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  const l = 0.2104542553 * x + 0.7936177850 * y - 0.0040720468 * z;
  const m = 1.9779984951 * x - 2.4285922050 * y + 0.4505937099 * z;
  const s = 0.0259040371 * x + 0.7827717662 * y - 0.8086757660 * z;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.4122214708 * l_ + 0.5363325363 * m_ + 0.0514459929 * s_;
  const a = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const b_ = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  const h = (Math.atan2(b_, a) * 180 / Math.PI + 360) % 360;

  return `${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(3)}`;
}

export function ThemeProvider({ 
  children, 
  workspaceId 
}: { 
  children: ReactNode;
  workspaceId: Id<"workspaces">;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // TODO: Replace with Convex query
  // const settings = useQuery(api.features.cmsLite.settings.queries.get, { workspaceId });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // TODO: Load theme colors from Convex settings
    
    // Placeholder: Apply default colors
    const primaryColor = "#3b82f6";
    const secondaryColor = "#8b5cf6";

    const primaryOklch = hexToOklch(primaryColor);
    const secondaryOklch = hexToOklch(secondaryColor);

    const root = document.documentElement;
    root.style.setProperty("--primary", `oklch(${primaryOklch})`);
    root.style.setProperty("--secondary", `oklch(${secondaryOklch})`);
  }, [workspaceId, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
