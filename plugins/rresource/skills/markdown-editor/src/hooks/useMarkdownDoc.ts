// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

const PREFIX = "rresource:md:";

export function useMarkdownDoc(key: string, initial = "") {
  const storageKey = PREFIX + key;
  const [value, setValue] = React.useState<string>(() => {
    if (typeof window === "undefined") return initial;
    return window.localStorage.getItem(storageKey) ?? initial;
  });
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, value);
  }, [storageKey, value]);
  return [value, setValue] as const;
}
