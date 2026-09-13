"use client";
import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  applyTheme,
  nextTheme,
  readTheme,
  type Theme,
} from "../lib/theme";

// React adapter over the framework-neutral theme semantics. Dark stays the
// default; the explicit user choice is persisted and applied as data-theme.
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(readTheme(window.localStorage));
  }, []);

  useEffect(() => {
    applyTheme(theme, document.documentElement, window.localStorage);
  }, [theme]);

  return [theme, () => setTheme((current) => nextTheme(current))];
}

export type { Theme } from "../lib/theme";
